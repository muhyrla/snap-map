"""
Верификация фото через внешнее vision-API (OpenRouter, OpenAI-совместимое).
Замена локальной CLIP-модели: шлём картинку + описание квеста, получаем score 0..1.

Совместимо по сигнатуре с llm.zero_shot.probability_of, чтобы воркер мог
переключаться между бэкендами без изменений в основной логике.
"""
from __future__ import annotations

import base64
import json
import os
import re
from typing import Iterable, Optional, Union

import requests

OPENROUTER_API_URL = os.getenv(
    "OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions"
)
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
REQUEST_TIMEOUT = int(os.getenv("OPENROUTER_TIMEOUT", "60"))


def _detect_mime(data: bytes) -> str:
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    return "image/jpeg"


def _encode_image(image_path: str) -> str:
    with open(image_path, "rb") as f:
        raw = f.read()
    mime = _detect_mime(raw)
    b64 = base64.b64encode(raw).decode("ascii")
    return f"data:{mime};base64,{b64}"


PROMPT_TEMPLATE = (
    "You are an automated verifier for a photo-quest game. "
    'The player was asked to take a photo matching this quest: "{label}". '
    "Look at the image and judge how well it genuinely satisfies the quest. "
    'Respond with ONLY a compact JSON object: {{"score": <float 0..1>, "reason": <short string>}}. '
    "score = your confidence the photo fulfils the quest "
    "(1.0 = clearly matches, 0.0 = unrelated). Output nothing except the JSON."
)


def _content_to_text(content: Union[str, list]) -> str:
    if isinstance(content, str):
        return content
    # некоторые модели возвращают content как список частей
    if isinstance(content, list):
        parts = []
        for p in content:
            if isinstance(p, dict) and p.get("type") == "text":
                parts.append(p.get("text", ""))
            elif isinstance(p, str):
                parts.append(p)
        return " ".join(parts)
    return str(content)


def _parse_score(content: str) -> float:
    # 1) прямой JSON
    try:
        obj = json.loads(content)
        return float(obj.get("score", 0.0))
    except Exception:
        pass
    # 2) JSON внутри текста
    m = re.search(r"\{.*\}", content, re.DOTALL)
    if m:
        try:
            obj = json.loads(m.group(0))
            return float(obj.get("score", 0.0))
        except Exception:
            pass
    # 3) просто число 0..1
    m = re.search(r"(?<![\d.])(0(?:\.\d+)?|1(?:\.0+)?)(?![\d.])", content)
    if m:
        try:
            return float(m.group(1))
        except Exception:
            pass
    return 0.0


def probability_of(
    image: str,
    target_label: str,
    other_labels: Optional[Iterable[str]] = None,  # игнорируется, для совместимости с CLIP-бэкендом
    model_name: Optional[str] = None,
) -> float:
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not set")

    data_url = _encode_image(image)
    prompt = PROMPT_TEMPLATE.format(label=target_label)
    payload = {
        "model": model_name or OPENROUTER_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
        "temperature": 0,
        "max_tokens": 200,
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        # OpenRouter рекомендует эти заголовки (необязательные)
        "HTTP-Referer": os.getenv("OPENROUTER_REFERER", "https://snapmap.local"),
        "X-Title": "SnapMap Verifier",
    }

    resp = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    body = resp.json()
    content = _content_to_text(body["choices"][0]["message"]["content"])
    score = _parse_score(content)
    return max(0.0, min(1.0, score))


if __name__ == "__main__":
    import sys

    prob = probability_of(sys.argv[1], target_label=sys.argv[2])
    print(f"score('{sys.argv[2]}') = {prob:.4f}")

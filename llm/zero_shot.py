from __future__ import annotations
import sys
from typing import Iterable, List, Dict, Optional, Union

_classifier_pipeline = None


_DEFAULT_OTHER_LABELS: List[str] = [
    "background",
    "other",
    "unknown",
    "none",
]


def _get_classifier(model_name: str = "openai/clip-vit-large-patch14-336"):
    global _classifier_pipeline
    if _classifier_pipeline is None:
        from transformers import pipeline
        _classifier_pipeline = pipeline(
            "zero-shot-image-classification",
            model=model_name,
        )
    return _classifier_pipeline


def classify_image(
    image: Union[str, "PIL.Image.Image"],
    candidate_labels: Iterable[str],
    model_name: str = "openai/clip-vit-large-patch14-336",
) -> Dict[str, float]:
    labels: List[str] = list(candidate_labels)
    if not labels:
        raise ValueError("candidate_labels не должен быть пустым")

    classifier = _get_classifier(model_name)
    results = classifier(image, candidate_labels=labels)
    return {item["label"]: float(item["score"]) for item in results}


def probability_of(
    image: Union[str, "PIL.Image.Image"],
    target_label: str,
    other_labels: Optional[Iterable[str]] = None,
    model_name: str = "openai/clip-vit-large-patch14-336",
) -> float:
    labels: List[str] = list(other_labels) if other_labels else list(_DEFAULT_OTHER_LABELS)
    if target_label not in labels:
        labels.append(target_label)

    scores = classify_image(image, labels, model_name=model_name)
    return float(scores.get(target_label, 0.0))


def probability(
    image_path: str,
    expected_label: str,
    other_labels: Optional[Iterable[str]] = None,
    model_name: str = "openai/clip-vit-large-patch14-336",
) -> float:
    return probability_of(
        image=image_path,
        target_label=expected_label,
        other_labels=other_labels,
        model_name=model_name,
    )


if __name__ == "__main__":
    image_path = sys.argv[1]
    target = sys.argv[2]
    others = sys.argv[3:]

    prob = probability_of(image_path, target_label=target, other_labels=others)
    print(f"Probability('{target}') = {prob:.4f}")
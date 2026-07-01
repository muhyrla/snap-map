# Контекст сборки — корень репозитория (нужны и workers/, и llm/).
FROM python:3.11-slim

WORKDIR /app

# Лёгкий образ: бэкенд verifier по умолчанию = openrouter (внешнее API),
# torch/transformers НЕ ставим. Для CLIP-режима собирайте с --build-arg.
COPY workers/requirements.txt /app/workers/requirements.txt
RUN pip install --no-cache-dir -r /app/workers/requirements.txt

# Код
COPY llm /app/llm
COPY workers /app/workers

ENV PYTHONPATH=/app

CMD ["python", "workers/verification_worker.py"]

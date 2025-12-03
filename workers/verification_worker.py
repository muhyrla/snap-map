import json
import logging
import os
import time
import uuid
import psycopg2
import boto3
from pathlib import Path
import tempfile

# DB config
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
DB_NAME = os.getenv("POSTGRES_DB", "snap-map")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")

# RabbitMQ
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "127.0.0.1")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "moderation:queue")

# S3
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://127.0.0.1:9000")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
S3_BUCKET = os.getenv("S3_BUCKET", "snapmap")

VERIFICATION_THRESHOLD = float(os.getenv("VERIFICATION_THRESHOLD", "0.55"))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
LOG = logging.getLogger("verification_worker")

# DB connection
conn = psycopg2.connect(
    host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
)
conn.autocommit = True

# S3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION,
)

def _result_table_insert(task_id, payload):
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO verification_result (task_id, result_json) VALUES (%s, %s)""",
        (task_id, json.dumps(payload)),
    )
    cur.close()

def _status_table_insert(task_id, state, message, user_id, object_key):
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO verification_status (task_id, state, user_id, object_key, message, updated_at)
           VALUES (%s, %s, %s, %s, %s, NOW())""",
        (task_id, state, user_id, object_key, message),
    )
    cur.close()

def _status_table_update(task_id, state, message):
    cur = conn.cursor()
    cur.execute(
        """UPDATE verification_status SET state=%s, message=%s, updated_at=NOW() WHERE task_id=%s""",
        (state, message, task_id),
    )
    LOG.info(f"Updated {cur.rowcount} rows in verification_status for task {task_id}")
    cur.close()

def download_to_temp(bucket: str, object_key: str) -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False)
    tmp_path = tmp.name
    tmp.close()
    s3_client.download_file(bucket, object_key, tmp_path)
    print(tmp_path)
    return tmp_path

def process_task(raw_task: str) -> None:
    task = json.loads(raw_task)
    task_id = task["taskId"]
    LOG.info("Processing task %s", task_id)

    # mark processing
    _status_table_update(task_id, "PROCESSING", "Worker started")

    try:
        temp_path = download_to_temp(task["bucket"], task["objectKey"])
        # using the same probability_of from llm.zero_shot
        from llm.zero_shot import probability_of
        score = probability_of(
            temp_path,
            target_label=task["expectedLabel"],
            other_labels=["background", "other", "unknown", "none"],
        )
    finally:
        try:
            os.remove(temp_path)
        except FileNotFoundError:
            pass

    decision = "APPROVED" if score >= VERIFICATION_THRESHOLD else "REJECTED"
    message = f"Score {score:.3f} vs threshold {VERIFICATION_THRESHOLD:.2f}"

    _status_table_update(task_id, decision, message)

    result = {
        "taskId": task_id,
        "userId": task["userId"],
        "userTgId": task.get("userTgId"),
        "questId": task.get("questId"),
        "objectKey": task["objectKey"],
        "expectedLabel": task["expectedLabel"],
        "allowFeedPhotos": task.get("allowFeedPhotos", False),
        "decision": decision,
        "score": score,
        "threshold": VERIFICATION_THRESHOLD,
        "checkedAtEpochMillis": int(time.time() * 1000),
    }

    _result_table_insert(task_id, result)
    LOG.info("Task %s %s", task_id, decision)

def main() -> None:
    import pika
    credentials = pika.PlainCredentials("guest", "guest")
    params = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)

    def callback(ch, method, properties, body):
        process_task(body.decode())
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=callback)
    LOG.info("Worker started, waiting for tasks.")
    channel.start_consuming()

if __name__ == "__main__":
    main()

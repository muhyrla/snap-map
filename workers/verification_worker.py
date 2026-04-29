import json
import logging
import os
import tempfile
import time
from pathlib import Path
from typing import Any, Dict, Optional

import boto3
import redis
import pika

import sys

# Добавляем корень проекта в PYTHONPATH, чтобы можно было импортировать llm.zero_shot
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

from llm.zero_shot import probability_of

logging.basicConfig(
	level=logging.INFO,
	format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("verification_worker")


def env(name: str, default: Optional[str] = None) -> str:
	value = os.getenv(name, default)
	if value is None:
		raise RuntimeError(f"Required environment variable {name} is not set")
	return value


REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD") or None
REDIS_DB = int(os.getenv("REDIS_DATABASE", "0"))
STATUS_PREFIX = os.getenv("REDIS_STATUS_KEY_PREFIX", "moderation:status")
RESULT_PREFIX = os.getenv("REDIS_RESULT_KEY_PREFIX", "moderation:result")
EVENTS_TOPIC = os.getenv("REDIS_EVENTS_TOPIC", "moderation:events")
TASK_TTL_SECONDS = int(os.getenv("REDIS_TASK_TTL_SECONDS", "86400"))
VERIFICATION_THRESHOLD = float(os.getenv("VERIFICATION_THRESHOLD", "0.55"))

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "127.0.0.1")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBIT_USER = os.getenv("RABBIT_USER", "guest")
RABBIT_PASS = os.getenv("RABBIT_PASS", "guest")
QUEUE_NAME = os.getenv("RABBITMQ_ROUTING_KEY", "moderation.tasks")

OTHER_LABELS = [
	"background",
	"other",
	"unknown",
	"none",
]

redis_client = redis.Redis(
	host=REDIS_HOST,
	port=REDIS_PORT,
	password=REDIS_PASSWORD,
	db=REDIS_DB,
	decode_responses=True,
	socket_timeout=10,
)

s3_client = boto3.client(
	"s3",
	endpoint_url=os.getenv("S3_ENDPOINT", "http://127.0.0.1:9000"),
	aws_access_key_id=os.getenv("S3_ACCESS_KEY", "minioadmin"),
	aws_secret_access_key=os.getenv("S3_SECRET_KEY", "minioadmin"),
	region_name=os.getenv("S3_REGION", "us-east-1"),
)


def _status_key(task_id: str) -> str:
	return f"{STATUS_PREFIX}:{task_id}"


def _result_key(task_id: str) -> str:
	return f"{RESULT_PREFIX}:{task_id}"


def save_status(task: Dict[str, Any], state: str, message: str) -> None:
	status_doc = {
		"taskId": task["taskId"],
		"state": state,
		"userId": task["userId"],
		"objectKey": task["objectKey"],
		"message": message,
		"updatedAtEpochMillis": int(time.time() * 1000),
	}
	redis_client.set(
		_status_key(task["taskId"]),
		json.dumps(status_doc),
		ex=TASK_TTL_SECONDS,
	)


def save_result(task_id: str, result: Dict[str, Any]) -> None:
	redis_client.set(
		_result_key(task_id),
		json.dumps(result),
		ex=TASK_TTL_SECONDS,
	)


def publish_event(payload: Dict[str, Any]) -> None:
	redis_client.publish(EVENTS_TOPIC, json.dumps(payload))


def download_to_temp(bucket: str, object_key: str) -> str:
	tmp = tempfile.NamedTemporaryFile(delete=False)
	tmp_path = tmp.name
	tmp.close()
	s3_client.download_file(bucket, object_key, tmp_path)
	return tmp_path


def handle_task(ch, method, properties, body):
	try:
		task = json.loads(body)
		task_id = task["taskId"]
		logger.info("Processing task %s for user %s", task_id, task["userId"])

		save_status(task, "PROCESSING", "Worker started")

		temp_path = download_to_temp(task["bucket"], task["objectKey"])
		try:
			score = probability_of(
				temp_path,
				target_label=task["expectedLabel"],
				other_labels=OTHER_LABELS,
			)
		finally:
			try:
				os.remove(temp_path)
			except FileNotFoundError:
				pass

		decision = "APPROVED" if score >= VERIFICATION_THRESHOLD else "REJECTED"
		message = (
			f"Score {score:.3f} vs threshold {VERIFICATION_THRESHOLD:.2f}"
		)

		save_status(task, decision, message)
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
		save_result(task_id, result)
		publish_event(
			{
				"type": "VERIFICATION_COMPLETED",
				"taskId": task_id,
				"status": decision,
				"userId": task["userId"],
			}
		)

		logger.info("Task %s %s (%s)", task_id, decision, message)
		ch.basic_ack(delivery_tag=method.delivery_tag)
	except Exception as exc:  # pylint: disable=broad-except
		logger.exception("Task processing failed: %s", exc)
		# В случае ошибки возвращаем в очередь
		ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def main() -> None:
	logger.info("Connecting to RabbitMQ at %s:%s", RABBITMQ_HOST, RABBITMQ_PORT)
	credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
	parameters = pika.ConnectionParameters(
		host=RABBITMQ_HOST,
		port=RABBITMQ_PORT,
		credentials=credentials,
		heartbeat=600,
		blocked_connection_timeout=300
	)
	
	while True:
		try:
			connection = pika.BlockingConnection(parameters)
			channel = connection.channel()
			channel.queue_declare(queue=QUEUE_NAME, durable=True)
			
			# Устанавливаем prefetch_count=1, чтобы воркер брал по одной задаче
			channel.basic_qos(prefetch_count=1)
			channel.basic_consume(queue=QUEUE_NAME, on_message_callback=handle_task)

			logger.info("Worker started. Waiting for tasks on %s", QUEUE_NAME)
			channel.start_consuming()
		except pika.exceptions.AMQPConnectionError as exc:
			logger.error("Connection failed, retrying in 5s... (%s)", exc)
			time.sleep(5)
		except KeyboardInterrupt:
			logger.info("Worker interrupted, exiting")
			break


if __name__ == "__main__":
	main()

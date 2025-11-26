import json
import logging
import os
import tempfile
import time
from pathlib import Path
from typing import Any, Dict, Optional

import boto3
import redis

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
QUEUE_KEY = os.getenv("REDIS_QUEUE_KEY", "moderation:queue")
STATUS_PREFIX = os.getenv("REDIS_STATUS_KEY_PREFIX", "moderation:status")
RESULT_PREFIX = os.getenv("REDIS_RESULT_KEY_PREFIX", "moderation:result")
EVENTS_TOPIC = os.getenv("REDIS_EVENTS_TOPIC", "moderation:events")
TASK_TTL_SECONDS = int(os.getenv("REDIS_TASK_TTL_SECONDS", "86400"))
VERIFICATION_THRESHOLD = float(os.getenv("VERIFICATION_THRESHOLD", "0.55"))

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


def handle_task(raw_task: str) -> None:
	task = json.loads(raw_task)
	task_id = task["taskId"]
	logger.info("Processing task %s for user %s", task_id, task["userId"])

	save_status(task, "PROCESSING", "Worker started")

	try:
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
	except Exception as exc:  # pylint: disable=broad-except
		logger.exception("Task %s failed: %s", task_id, exc)
		save_status(task, "FAILED", str(exc))
		publish_event(
			{
				"type": "VERIFICATION_FAILED",
				"taskId": task_id,
				"status": "FAILED",
				"userId": task["userId"],
				"error": str(exc),
			}
		)


def main() -> None:
	logger.info("Verification worker started. Waiting for tasks on %s", QUEUE_KEY)
	while True:
		try:
			item = redis_client.brpop(QUEUE_KEY, timeout=5)
			if not item:
				continue
			_, raw_task = item
			handle_task(raw_task)
		except redis.RedisError as exc:
			logger.error("Redis error: %s", exc)
			time.sleep(2)
		except KeyboardInterrupt:
			logger.info("Worker interrupted, exiting")
			break


if __name__ == "__main__":
	main()



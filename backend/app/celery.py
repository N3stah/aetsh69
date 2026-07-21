import os
from celery import Celery
from celery.signals import task_failure, task_success
import logging

logger = logging.getLogger(__name__)

# ─── Celery App Instance ───
celery_app = Celery(
    "aetsh69",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    include=[
        "app.tasks.email",
        "app.tasks.ai",
        "app.tasks.cleanup",
    ],
)

# ─── Configuration ───
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Nairobi",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,          # 5 min hard limit
    task_soft_time_limit=240,     # 4 min soft limit
    worker_prefetch_multiplier=1,   # fair task distribution
    beat_schedule={
        "cleanup-old-conversations": {
            "task": "app.tasks.cleanup.purge_stale_conversations",
            "schedule": 86400.0,  # daily
        },
        "health-ping": {
            "task": "app.tasks.cleanup.health_ping",
            "schedule": 60.0,     # every minute
        },
    },
)

# ─── Signals ───
@task_failure.connect
def handle_task_failure(sender=None, task_id=None, exception=None, **kwargs):
    logger.error(f"Task {task_id} failed: {exception}")

@task_success.connect
def handle_task_success(sender=None, result=None, **kwargs):
    logger.info(f"Task {sender.name} completed successfully")

from app.celery import celery_app
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def purge_stale_conversations(days: int = 30):
    """Delete AI conversations older than N days."""
    logger.info(f"Purging conversations older than {days} days")
    # TODO: wire to SQLAlchemy async session
    # from app.db.session import async_session
    # async with async_session() as db:
    #     await db.execute(text("DELETE FROM ai_conversations WHERE last_message_at < NOW() - INTERVAL ':d days'"), {"d": days})
    return {"status": "purged"}

@celery_app.task
def health_ping():
    """Keep-alive for monitoring."""
    return {"status": "ok", "service": "celery-beat"}

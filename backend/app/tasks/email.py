from app.celery import celery_app
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def send_verification_email(self, to_email: str, token: str):
    """Send email verification link. Retry 3x on failure."""
    try:
        # TODO: wire to your SMTP settings from app.config
        logger.info(f"Sending verification email to {to_email}")
        # from app.services.email import send_email
        # send_email(to=to_email, subject="Verify your account", body=f"Token: {token}")
        return {"status": "sent", "to": to_email}
    except Exception as exc:
        logger.error(f"Email failed: {exc}")
        raise self.retry(exc=exc, countdown=60)

@celery_app.task(bind=True, max_retries=3)
def send_password_reset_email(self, to_email: str, token: str):
    """Send password reset link."""
    try:
        logger.info(f"Sending password reset to {to_email}")
        return {"status": "sent", "to": to_email}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)

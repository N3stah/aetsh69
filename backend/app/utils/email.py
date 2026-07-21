import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

def send_password_reset_email(recipient: str, reset_link: str):
    """Send password reset email via SMTP."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM", smtp_user)
    
    if not smtp_user or not smtp_pass:
        logger.error("SMTP credentials not set")
        return
    
    subject = "Password Reset - AETSH-69"
    html = f"""
    <html>
    <body>
    <h2>Reset Your Password</h2>
    <p>Click the link below to set a new password. This link expires in 24 hours.</p>
    <a href="{reset_link}">Reset Password</a>
    <p>If you didn't request this, ignore this email.</p>
    </body>
    </html>
    """
    
    msg = MIMEMultipart()
    msg["From"] = from_email
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))
    
    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        logger.info(f"Password reset email sent to {recipient}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")

import logging
import smtplib
import time
from email.message import EmailMessage
from typing import Optional, Tuple

import requests
from sqlalchemy.orm import Session

from core.config import settings
from domains.settings.models import NotificationSettings

logger = logging.getLogger(__name__)

# ─── Rate Limiting (In-Memory) ────────────────────────────────────────────────
# Simple sliding window rate limiter per IP.
# For a single-instance portfolio, this is perfectly adequate.
_rate_limits = {}

def check_rate_limit(ip: str) -> bool:
    """Returns True if allowed, False if rate limited."""
    if not ip:
        return True
    
    now = time.time()
    window = 3600  # 1 hour
    limit = settings.CONTACT_RATE_LIMIT_PER_HOUR

    # Clean up old entries
    history = _rate_limits.get(ip, [])
    history = [t for t in history if now - t < window]
    
    if len(history) >= limit:
        _rate_limits[ip] = history
        return False
        
    history.append(now)
    _rate_limits[ip] = history
    return True


# ─── Captcha & Geolocation ────────────────────────────────────────────────────

def verify_turnstile(token: Optional[str], ip: Optional[str]) -> Optional[float]:
    """
    Verifies Cloudflare Turnstile token.
    Returns 1.0 (success), 0.0 (fail), or None (skipped because no secret key).
    """
    secret = settings.TURNSTILE_SECRET_KEY
    if not secret:
        logger.warning("TURNSTILE_SECRET_KEY not set. Skipping captcha verification.")
        return None
        
    if not token:
        return 0.0

    try:
        data = {"secret": secret, "response": token}
        if ip:
            data["remoteip"] = ip
            
        res = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data=data,
            timeout=5
        )
        res.raise_for_status()
        result = res.json()
        return 1.0 if result.get("success") else 0.0
    except Exception as e:
        logger.error("Turnstile verification failed: %s", e)
        return 0.0


def get_geolocation(ip: str) -> Tuple[Optional[str], Optional[str]]:
    """Returns (country, region) using ipapi.co. Non-fatal on failure."""
    if not settings.GEOLOCATION_ENABLED or not ip or ip in ("127.0.0.1", "::1"):
        return None, None
        
    try:
        res = requests.get(f"https://ipapi.co/{ip}/json/", timeout=3)
        if res.status_code == 200:
            data = res.json()
            return data.get("country_name"), data.get("region")
    except Exception as e:
        logger.warning("Geolocation failed for %s: %s", ip, e)
    return None, None


# ─── Email Sending ────────────────────────────────────────────────────────────

def get_notification_recipient(db: Session) -> str:
    """Gets recipient from DB settings, falls back to env var."""
    notif = db.query(NotificationSettings).first()
    if notif and getattr(notif, "contact_to_email", None):
        return notif.contact_to_email
    return settings.CONTACT_TO_EMAIL


def _send_smtp_email(msg: EmailMessage) -> None:
    """Sends an email using the configured SMTP server."""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.warning("SMTP not fully configured. Email not sent.")
        return

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            logger.info("Email sent successfully to %s", msg["To"])
    except Exception as e:
        logger.error("Failed to send email: %s", e)
        raise


def send_admin_notification(db: Session, submission) -> None:
    """Sends notification to the admin about a new contact message."""
    to_email = get_notification_recipient(db)

    # Configurable subject from dashboard settings (falls back to a default)
    notif = db.query(NotificationSettings).first()
    subject = getattr(notif, "contact_email_subject", "") if notif else ""
    if not subject:
        subject = f"New Contact: {submission.subject}"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg["Reply-To"] = submission.email
    
    # Threading ID for Mail.app
    msg["Message-ID"] = f"<contact-{submission.id}@{settings.SMTP_HOST}>"

    body = f"""
    <html>
      <body style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2>New message from {submission.name}</h2>
        <p><strong>Email:</strong> <a href="mailto:{submission.email}">{submission.email}</a></p>
        <p><strong>Subject:</strong> {submission.subject}</p>
        <hr>
        <p style="white-space: pre-wrap;">{submission.message}</p>
        <hr>
        <p style="font-size: 0.9em; color: #666;">
          IP: {submission.ip_address} | Country: {submission.country or 'Unknown'}<br>
          <em>You can reply directly to this email to answer the sender, or just take it as a notification.</em><br>
          Prefer to manage the conversation from your dashboard? <a href="https://wallydev.dev/dashboard/messages">Open Messages</a>
        </p>
      </body>
    </html>
    """
    msg.set_content("Please view this email in an HTML client.")
    msg.add_alternative(body, subtype="html")
    
    _send_smtp_email(msg)


def send_reply_email(submission, reply_message: str) -> None:
    """Sends a reply from the dashboard to the original sender."""
    msg = EmailMessage()
    msg["Subject"] = f"Re: {submission.subject}"
    msg["From"] = settings.SMTP_FROM
    msg["To"] = submission.email
    
    # Threading headers
    ref_id = f"<contact-{submission.id}@{settings.SMTP_HOST}>"
    msg["In-Reply-To"] = ref_id
    msg["References"] = ref_id

    body = f"""
    <html>
      <body style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <p style="white-space: pre-wrap;">{reply_message}</p>
        <br>
        <hr>
        <p style="font-size: 0.9em; color: #666;">
          On {submission.created_at.strftime('%Y-%m-%d %H:%M')}, {submission.name} wrote:<br>
          <blockquote style="border-left: 2px solid #ccc; margin-left: 0; padding-left: 1em;">
            {submission.message}
          </blockquote>
        </p>
      </body>
    </html>
    """
    msg.set_content(reply_message)
    msg.add_alternative(body, subtype="html")
    
    _send_smtp_email(msg)

import logging
from datetime import datetime, timezone
from typing import Any, Dict

import requests
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

WEBHOOK_TIMEOUT_SECONDS = 5


def emit_event(db: Session, event_type: str, payload: Dict[str, Any]) -> bool:
    """Dispatch an event to the external comms-hub microservice.

    The event is only sent when ALL of these are true:
      - master switch enabled in notification_settings
      - the specific event toggle is enabled
      - a comms-hub URL is configured

    Failures are logged but NEVER raise: notifications must not break
    the main application flow. Returns True if the webhook was delivered.
    """
    # Import here to avoid circular imports at module load time.
    from domains.settings.models import NotificationSettings

    try:
        notif = db.query(NotificationSettings).first()
        if not notif or not notif.master_enabled:
            return False
        if not notif.comms_hub_url:
            return False

        events = notif.events or {}
        if not events.get(event_type, False):
            return False

        body = {
            "event": event_type,
            "source": "portfolio",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": payload,
        }

        headers = {"Content-Type": "application/json"}
        if notif.comms_hub_token:
            headers["Authorization"] = f"Bearer {notif.comms_hub_token}"

        response = requests.post(
            notif.comms_hub_url,
            json=body,
            headers=headers,
            timeout=WEBHOOK_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        logger.info("comms-hub event '%s' delivered (%s)", event_type, response.status_code)
        return True
    except Exception as exc:  # noqa: BLE001 - intentionally broad, must never break flow
        logger.warning("comms-hub event '%s' failed: %s", event_type, exc)
        return False

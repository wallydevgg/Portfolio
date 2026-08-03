from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from domains.settings import models, schemas
from core.security import get_current_user
from core.events import emit_event

router = APIRouter()

@router.get("/seo", response_model=schemas.SeoSettingsResponse)
def get_seo_settings(db: Session = Depends(get_db)):
    seo = db.query(models.SeoSettings).first()
    if not seo:
        # Create default if it doesn't exist
        seo = models.SeoSettings(
            title={"en": "Portfolio", "es": "Portafolio"},
            description={"en": "My portfolio", "es": "Mi portafolio"},
            keywords={"en": "developer", "es": "desarrollador"},
            og_image="",
            site_url="",
            twitter_handle=""
        )
        db.add(seo)
        db.commit()
        db.refresh(seo)
    return seo

@router.put("/seo", response_model=schemas.SeoSettingsResponse)
def update_seo_settings(
    settings_in: schemas.SeoSettingsUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    seo = db.query(models.SeoSettings).first()
    if not seo:
        seo = models.SeoSettings(**settings_in.dict())
        db.add(seo)
    else:
        for var, value in vars(settings_in).items():
            setattr(seo, var, value) if value is not None else None
    
    db.commit()
    db.refresh(seo)
    return seo


@router.get("/notifications", response_model=schemas.NotificationSettingsResponse)
def get_notification_settings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    notif = db.query(models.NotificationSettings).first()
    if not notif:
        notif = models.NotificationSettings(
            master_enabled=False,
            comms_hub_url="",
            comms_hub_token="",
            contact_to_email="",
            contact_email_subject="Contact form from wallydev.dev",
            events={
                "new_contact_message": True,
                "new_comment": False,
                "new_like": False,
                "reply_sent": False
            }
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
    return notif


@router.put("/notifications", response_model=schemas.NotificationSettingsResponse)
def update_notification_settings(
    settings_in: schemas.NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    notif = db.query(models.NotificationSettings).first()
    if not notif:
        notif = models.NotificationSettings(**settings_in.dict())
        db.add(notif)
    else:
        for var, value in vars(settings_in).items():
            setattr(notif, var, value) if value is not None else None
            
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/notifications/test")
def test_notification(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Sends a test event to comms-hub to verify connectivity."""
    success = emit_event(db, "test_event", {"message": "Hello from Portfolio Dashboard!"})
    if not success:
        raise HTTPException(
            status_code=400, 
            detail="Failed to send test event. Check if master switch is ON, URL is correct, and 'test_event' is enabled (or just master switch)."
        )
    return {"detail": "Test event sent successfully"}

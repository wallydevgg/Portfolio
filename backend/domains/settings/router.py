from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from domains.settings import models, schemas
from core.security import get_current_user

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

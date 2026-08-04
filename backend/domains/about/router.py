from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from domains.about import models, schemas

router = APIRouter()

DEFAULT_TEXT = {
    "en": "Software Engineer with 5+ years of experience designing and developing scalable web applications for mining, education, tourism, finance, accounting and ERP sectors. Specialized in Full Stack solutions using Python (Django, Django REST Framework, FastAPI) and JavaScript/TypeScript (React, Next.js, Angular and Node.js), with experience in legacy system modernization, process automation, multitenant SaaS architectures, enterprise system integration, ETL pipelines and cloud deployments on AWS. I have participated in every stage of the software lifecycle, from requirements gathering and architecture design to implementation, deployment, monitoring and production optimization. I focus on building maintainable software applying principles like Clean Architecture, Domain-Driven Design (DDD), SOLID and agile methodologies.",
    "es": "Software Engineer con más de 5 años de experiencia diseñando y desarrollando aplicaciones web escalables para los sectores minería, educación, turismo, finanzas, contabilidad y ERP. Especializado en el desarrollo de soluciones Full Stack utilizando Python (Django, Django REST Framework, FastAPI) y JavaScript/TypeScript (React, Next.js, Angular y Node.js), con experiencia en modernización de sistemas legados, automatización de procesos, arquitecturas SaaS multitenant, integración de sistemas empresariales, pipelines ETL y despliegues cloud sobre AWS. He participado en todas las etapas del ciclo de vida del software, desde el levantamiento de requerimientos y diseño de arquitectura hasta la implementación, despliegue, monitoreo y optimización en producción. Me enfoco en construir software mantenible aplicando principios como Clean Architecture, Domain-Driven Design (DDD), SOLID y metodologías ágiles.",
}


@router.get("", response_model=schemas.AboutSettingsResponse)
def get_about_settings(db: Session = Depends(get_db)):
    """Public endpoint to fetch the About section content."""
    about = db.query(models.AboutSettings).first()
    if not about:
        about = models.AboutSettings(
            text=DEFAULT_TEXT,
            image_url="",
            layout=models.AboutSettings.LAYOUT_TEXT_LEFT,
        )
        db.add(about)
        db.commit()
        db.refresh(about)
    return about


@router.put("", response_model=schemas.AboutSettingsResponse)
def update_about_settings(
    settings_in: schemas.AboutSettingsUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update the About section content (Dashboard)."""
    if settings_in.layout not in models.AboutSettings.VALID_LAYOUTS:
        raise HTTPException(status_code=422, detail="Invalid layout. Use text-left, text-right, text-top or text-bottom.")

    about = db.query(models.AboutSettings).first()
    if not about:
        about = models.AboutSettings(**settings_in.model_dump())
        db.add(about)
    else:
        for var, value in settings_in.model_dump().items():
            if value is not None:
                setattr(about, var, value)

    db.commit()
    db.refresh(about)
    return about

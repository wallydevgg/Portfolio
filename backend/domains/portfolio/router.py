from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from core.storage import upload_file, delete_file, file_exists
from core.config import settings
from domains.portfolio import models, schemas
from domains.users.models import User
import uuid

router = APIRouter(tags=["portfolio"])


class CVLanguage(str, Enum):
    """Idiomas con CV propio.

    Es un Enum y no un str suelto para que FastAPI rechace cualquier otro valor
    con un 422 antes de llegar al cuerpo del endpoint: sin eso, un `lang`
    arbitrario se colaría en la clave del objeto.
    """

    es = "es"
    en = "en"


# Clave del archivo anterior al CV por idioma. Sigue aquí porque en producción
# hay un PDF subido con ella y no puede desaparecer porque cambiemos el
# esquema: mientras no exista el del idioma pedido, se sirve este.
LEGACY_CV_KEY = "cv/Waldir_Apaza_CV.pdf"

MAX_CV_BYTES = 10 * 1024 * 1024
PDF_SIGNATURE = b"%PDF-"


def _cv_key(lang: CVLanguage) -> str:
    return f"cv/cv-{lang.value}.pdf"


def _public_url(key: str) -> str:
    return f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET}/{key}"


def _cv_url(lang: CVLanguage):
    """URL del CV de ese idioma, con caída al archivo antiguo."""
    key = _cv_key(lang)
    if file_exists(key):
        return _public_url(key)
    if file_exists(LEGACY_CV_KEY):
        return _public_url(LEGACY_CV_KEY)
    return None

# === EXPERIENCE ENDPOINTS ===

@router.get("/experience", response_model=list[schemas.ExperienceSchema])
def get_experiences(db: Session = Depends(get_db)):
    experiences = db.query(models.Experience).order_by(models.Experience.order).all()
    return experiences

@router.post("/experience", response_model=schemas.ExperienceSchema, dependencies=[Depends(get_current_user)])
def create_experience(exp: schemas.ExperienceCreate, db: Session = Depends(get_db)):
    db_exp = models.Experience(**exp.dict())
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.put("/experience/{exp_id}", response_model=schemas.ExperienceSchema, dependencies=[Depends(get_current_user)])
def update_experience(exp_id: int, exp: schemas.ExperienceUpdate, db: Session = Depends(get_db)):
    db_exp = db.query(models.Experience).filter(models.Experience.id == exp_id).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    data = exp.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(db_exp, k, v)

    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.delete("/experience/{exp_id}", status_code=204, dependencies=[Depends(get_current_user)])
def delete_experience(exp_id: int, db: Session = Depends(get_db)):
    db_exp = db.query(models.Experience).filter(models.Experience.id == exp_id).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    db.delete(db_exp)
    db.commit()

# === SKILL CATEGORY ENDPOINTS ===

@router.get("/skills", response_model=list[schemas.SkillCategorySchema])
def get_skills(db: Session = Depends(get_db)):
    categories = db.query(models.SkillCategory).order_by(models.SkillCategory.order).all()
    return categories

@router.post("/skills/categories", response_model=schemas.SkillCategorySchema, dependencies=[Depends(get_current_user)])
def create_skill_category(cat: schemas.SkillCategoryCreate, db: Session = Depends(get_db)):
    db_cat = models.SkillCategory(**cat.dict())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.put("/skills/categories/{cat_id}", response_model=schemas.SkillCategorySchema, dependencies=[Depends(get_current_user)])
def update_skill_category(cat_id: int, cat: schemas.SkillCategoryUpdate, db: Session = Depends(get_db)):
    db_cat = db.query(models.SkillCategory).filter(models.SkillCategory.id == cat_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")

    data = cat.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(db_cat, k, v)

    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.delete("/skills/categories/{cat_id}", status_code=204, dependencies=[Depends(get_current_user)])
def delete_skill_category(cat_id: int, db: Session = Depends(get_db)):
    db_cat = db.query(models.SkillCategory).filter(models.SkillCategory.id == cat_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(db_cat)
    db.commit()

# === SKILL ENDPOINTS ===

@router.post("/skills/items", response_model=schemas.SkillSchema, dependencies=[Depends(get_current_user)])
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    db_skill = models.Skill(**skill.dict())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.put("/skills/items/{skill_id}", response_model=schemas.SkillSchema, dependencies=[Depends(get_current_user)])
def update_skill(skill_id: int, skill: schemas.SkillUpdate, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    data = skill.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(db_skill, k, v)

    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/skills/items/{skill_id}", status_code=204, dependencies=[Depends(get_current_user)])
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(db_skill)
    db.commit()

# === PROJECT ENDPOINTS ===

@router.get("/projects", response_model=list[schemas.ProjectSchema])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).order_by(models.Project.order).all()
    return projects

@router.post("/projects", response_model=schemas.ProjectSchema, dependencies=[Depends(get_current_user)])
def create_project(proj: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_proj = models.Project(**proj.dict())
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.put("/projects/{proj_id}", response_model=schemas.ProjectSchema, dependencies=[Depends(get_current_user)])
def update_project(proj_id: int, proj: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    db_proj = db.query(models.Project).filter(models.Project.id == proj_id).first()
    if not db_proj:
        raise HTTPException(status_code=404, detail="Project not found")

    data = proj.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(db_proj, k, v)

    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.delete("/projects/{proj_id}", status_code=204, dependencies=[Depends(get_current_user)])
def delete_project(proj_id: int, db: Session = Depends(get_db)):
    db_proj = db.query(models.Project).filter(models.Project.id == proj_id).first()
    if not db_proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if db_proj.image_url:
        file_name = db_proj.image_url.split("/")[-1]
        delete_file(file_name)

    db.delete(db_proj)
    db.commit()

# === UPLOAD ENDPOINT ===

@router.post("/upload", dependencies=[Depends(get_current_user)])
async def upload_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        file_name = f"projects/{uuid.uuid4()}_{file.filename}"

        url = upload_file(contents, file_name)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# === CV ENDPOINTS ===

@router.get("/cv")
def get_cvs():
    """Público: la URL del CV de cada idioma, o null si no hay ninguno.

    Devuelve el mapa entero y no un solo archivo para que el frontend pueda
    elegir por idioma y caer al otro sin una segunda petición.
    """
    return {lang.value: _cv_url(lang) for lang in CVLanguage}


@router.post("/cv/{lang}", dependencies=[Depends(get_current_user)])
async def upload_cv(lang: CVLanguage, file: UploadFile = File(...)):
    """Sube (o reemplaza) el CV de un idioma.

    La clave es fija por idioma, así que la URL pública no cambia al reemplazar
    el archivo y el botón de la portada sigue funcionando.

    Se comprueban tipo, tamaño y firma. El tipo declarado lo pone el cliente:
    sin mirar los bytes, cualquier cosa renombrada a .pdf acabaría servida desde
    un bucket público.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    contents = await file.read()

    if len(contents) > MAX_CV_BYTES:
        raise HTTPException(status_code=413, detail="The PDF must be 10 MB or smaller")

    if not contents.startswith(PDF_SIGNATURE):
        raise HTTPException(status_code=400, detail="File content does not match its type")

    try:
        url = upload_file(contents, _cv_key(lang), content_type="application/pdf")
    except Exception:
        raise HTTPException(status_code=502, detail="Could not store the CV")

    return {"lang": lang.value, "url": url}


@router.delete("/cv/{lang}", status_code=204, dependencies=[Depends(get_current_user)])
def delete_cv(lang: CVLanguage):
    """Borra el CV de un idioma. No toca el de los demás."""
    key = _cv_key(lang)
    if not file_exists(key):
        raise HTTPException(status_code=404, detail="CV not uploaded")
    delete_file(key)

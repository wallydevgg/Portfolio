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

CV_FILE_NAME = "cv/Waldir_Apaza_CV.pdf"

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

@router.post("/cv", dependencies=[Depends(get_current_user)])
async def upload_cv(file: UploadFile = File(...)):
    """Upload (or replace) the CV PDF. Stored at a fixed key so the public
    URL never changes."""
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        contents = await file.read()
        url = upload_file(contents, CV_FILE_NAME, content_type="application/pdf")
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/cv")
def get_cv():
    """Public: return the CV public URL (or 404 if not uploaded yet)."""
    if not file_exists(CV_FILE_NAME):
        raise HTTPException(status_code=404, detail="CV not uploaded")
    return {"url": f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET}/{CV_FILE_NAME}"}

@router.delete("/cv", status_code=204, dependencies=[Depends(get_current_user)])
def delete_cv():
    """Delete the uploaded CV."""
    if not file_exists(CV_FILE_NAME):
        raise HTTPException(status_code=404, detail="CV not uploaded")
    delete_file(CV_FILE_NAME)

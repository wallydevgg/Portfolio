from pydantic import BaseModel
from datetime import datetime

# === Shared Translation type ===

class Translation(BaseModel):
    en: str
    es: str

# === Experience ===

class ExperienceBase(BaseModel):
    company: str
    date: str
    title: Translation
    responsibilities: list[Translation]
    order: int = 0

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(BaseModel):
    company: str | None = None
    date: str | None = None
    title: Translation | None = None
    responsibilities: list[Translation] | None = None
    order: int | None = None

class ExperienceSchema(ExperienceBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

# === Skill Category ===

class SkillCategoryBase(BaseModel):
    name: Translation
    order: int = 0

class SkillCategoryCreate(SkillCategoryBase):
    pass

class SkillCategoryUpdate(BaseModel):
    name: Translation | None = None
    order: int | None = None

class SkillCategorySchema(SkillCategoryBase):
    id: int
    skills: list["SkillSchema"] = []
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

# === Skill ===

class SkillBase(BaseModel):
    name: str
    level: int
    order: int = 0

class SkillCreate(SkillBase):
    category_id: int

class SkillUpdate(BaseModel):
    name: str | None = None
    level: int | None = None
    category_id: int | None = None
    order: int | None = None

class SkillSchema(SkillBase):
    id: int
    category_id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

# Forward-reference resolution for nested SkillCategorySchema
SkillCategorySchema.model_rebuild()

# === Project ===

class ProjectBase(BaseModel):
    title: Translation
    description: Translation
    tech_stack: list[str]
    image_url: str | None = None
    website_link: str | None = None
    github_link: str | None = None
    order: int = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Translation | None = None
    description: Translation | None = None
    image_url: str | None = None
    tech_stack: list[str] | None = None
    website_link: str | None = None
    github_link: str | None = None
    order: int | None = None

class ProjectSchema(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

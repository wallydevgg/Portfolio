from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Experience(Base):
    __tablename__ = "experiences"

    id               = Column(Integer, primary_key=True, index=True)
    company          = Column(String, nullable=False)
    date             = Column(String, nullable=False)
    title            = Column(JSON, nullable=False)
    responsibilities = Column(JSON, nullable=False)
    order            = Column(Integer, default=0)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id     = Column(Integer, primary_key=True, index=True)
    name   = Column(JSON, nullable=False)
    order  = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    skills = relationship("Skill", back_populates="category", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    level       = Column(Integer, nullable=False)
    icon        = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("skill_categories.id", ondelete="CASCADE"), nullable=False)
    order       = Column(Integer, default=0)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("SkillCategory", back_populates="skills")

class Project(Base):
    __tablename__ = "projects"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(JSON, nullable=False)
    description  = Column(JSON, nullable=False)
    image_url    = Column(String, nullable=True)
    tech_stack   = Column(JSON, nullable=False)
    website_link = Column(String, nullable=True)
    github_link  = Column(String, nullable=True)
    order        = Column(Integer, default=0)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

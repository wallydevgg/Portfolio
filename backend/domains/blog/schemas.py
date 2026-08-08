from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    slug: str

class CategorySchema(CategoryBase):
    id: int
    slug: str

    class Config:
        from_attributes = True

class TagSchema(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    author_name: str = Field(min_length=1, max_length=80)
    content: str = Field(min_length=1, max_length=2000)

    @field_validator("author_name", "content")
    @classmethod
    def not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value

# Deliberately not inheriting from CommentCreate: the length limits apply to
# incoming submissions only, so pre-existing rows still serialize.
class CommentSchema(BaseModel):
    id: int
    post_id: int
    author_name: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: str
    content: str
    is_published: bool = False
    category_id: Optional[int] = None

class PostCreate(PostBase):
    slug: str
    tags: List[str] = []

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_published: Optional[bool] = None
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None

class PostSchema(PostBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    category: Optional[CategorySchema] = None
    tags: List[TagSchema] = []
    likes_count: int = 0
    comments_count: int = 0

    class Config:
        from_attributes = True

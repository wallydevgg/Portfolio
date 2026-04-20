from pydantic import BaseModel
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

class PostBase(BaseModel):
    title: str
    content: str
    is_published: bool = False
    category_id: Optional[int] = None

class PostCreate(PostBase):
    slug: str

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_published: Optional[bool] = None
    category_id: Optional[int] = None

class PostSchema(PostBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[CategorySchema] = None
    # tags will be added later

    class Config:
        from_attributes = True

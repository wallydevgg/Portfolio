from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from domains.blog import models, schemas

router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("/", response_model=List[schemas.PostSchema])
def list_posts(db: Session = Depends(get_db)):
    # Add filtering for is_published true in public routes, but this is admin/mixed
    posts = db.query(models.Post).all()
    return posts

@router.post("/", response_model=schemas.PostSchema, status_code=status.HTTP_201_CREATED)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_post = models.Post(
        title=post.title,
        slug=post.slug,
        content=post.content,
        is_published=post.is_published,
        category_id=post.category_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/{post_id}", response_model=schemas.PostSchema)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/{post_id}", response_model=schemas.PostSchema)
def update_post(post_id: int, post_update: schemas.PostUpdate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = post_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_post, key, value)
        
    db.commit()
    db.refresh(db_post)
    return db_post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db.delete(db_post)
    db.commit()
    return None

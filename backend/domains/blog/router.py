# ✅ GENERADO POR CLAUDE - Archivo: backend/domains/blog/router.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from domains.blog import models, schemas
from domains.users.models import User

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/", response_model=List[schemas.PostSchema])
def list_posts(
    db: Session = Depends(get_db),
    admin: str = Depends(lambda: None),
):
    return db.query(models.Post).filter(models.Post.is_published == True).order_by(models.Post.created_at.desc()).all()


@router.get("/all", response_model=List[schemas.PostSchema])
def list_all_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(models.Post).order_by(models.Post.created_at.desc()).all()


@router.get("/rss.xml")
def get_rss(db: Session = Depends(get_db)):
    posts = (
        db.query(models.Post)
        .filter(models.Post.is_published == True)
        .order_by(models.Post.created_at.desc())
        .limit(20)
        .all()
    )
    items = "".join(
        f"""<item>
      <title><![CDATA[{p.title}]]></title>
      <link>https://wallydev.dev/blog/{p.slug}</link>
      <guid>https://wallydev.dev/blog/{p.slug}</guid>
      <pubDate>{p.created_at.strftime("%a, %d %b %Y %H:%M:%S +0000")}</pubDate>
    </item>"""
        for p in posts
    )
    rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>wallydev — Blog</title>
    <link>https://wallydev.dev/blog</link>
    <description>Artículos sobre desarrollo fullstack, React, Python, DevOps y arquitectura de software.</description>
    <language>es</language>
    <atom:link href="https://wallydev.dev/api/v1/posts/rss.xml" rel="self" type="application/rss+xml"/>
    {items}
  </channel>
</rss>"""
    return Response(content=rss, media_type="application/rss+xml")


@router.post("/", response_model=schemas.PostSchema, status_code=status.HTTP_201_CREATED)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_post = models.Post(
        title=post.title,
        slug=post.slug,
        content=post.content,
        is_published=post.is_published,
        category_id=post.category_id,
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
def update_post(
    post_id: int,
    post_update: schemas.PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    for key, value in post_update.dict(exclude_unset=True).items():
        setattr(db_post, key, value)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(db_post)
    db.commit()
    return None

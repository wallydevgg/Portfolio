# ✅ GENERADO POR CLAUDE - Archivo: backend/domains/blog/router.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
from typing import List
from core import rate_limit
from core.config import settings
from core.database import get_db
from core.net import get_client_ip
from core.security import get_current_user
from domains.blog import models, schemas
from domains.users.models import User

router = APIRouter(prefix="/posts", tags=["posts"])


def _public_posts(db: Session):
    """Posts visible to anyone: published and not archived."""
    return db.query(models.Post).filter(
        models.Post.deleted_at.is_(None),
        models.Post.is_published.is_(True),
    )


def _active_posts(db: Session):
    """Posts the dashboard works with: drafts included, archived excluded."""
    return db.query(models.Post).filter(models.Post.deleted_at.is_(None))


def _get_post_or_404(db: Session, post_id: int) -> models.Post:
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


def _sync_tags(db: Session, post: models.Post, tag_names: List[str]) -> None:
    """Replace post tags with the given names (creating missing tags)."""
    if tag_names is None:
        return
    post.tags = []
    for name in tag_names:
        name = name.strip()
        if not name:
            continue
        tag = db.query(models.Tag).filter(models.Tag.name == name).first()
        if not tag:
            tag = models.Tag(name=name)
            db.add(tag)
            db.flush()
        post.tags.append(tag)


def _posts_with_counts(db: Session, query):
    """Eager-load relationships and attach like/comment counts as subqueries
    (avoids N+1 from Post.likes_count / Post.comments_count properties)."""
    counts_likes = (
        db.query(
            models.PostLike.post_id,
            func.count(models.PostLike.id).label("cnt"),
        )
        .group_by(models.PostLike.post_id)
        .subquery()
    )
    counts_comments = (
        db.query(
            models.Comment.post_id,
            func.count(models.Comment.id).label("cnt"),
        )
        .group_by(models.Comment.post_id)
        .subquery()
    )
    posts = (
        query.options(selectinload(models.Post.tags), selectinload(models.Post.category))
        .outerjoin(counts_likes, models.Post.id == counts_likes.c.post_id)
        .outerjoin(counts_comments, models.Post.id == counts_comments.c.post_id)
        .add_columns(
            func.coalesce(counts_likes.c.cnt, 0).label("likes_count"),
            func.coalesce(counts_comments.c.cnt, 0).label("comments_count"),
        )
        .all()
    )
    for post, likes_count, comments_count in posts:
        post._likes_count = likes_count
        post._comments_count = comments_count
    return [p for p, _, _ in posts]


@router.get("/", response_model=List[schemas.PostSchema])
def list_posts(
    db: Session = Depends(get_db),
    admin: str = Depends(lambda: None),
):
    query = _public_posts(db).order_by(models.Post.created_at.desc())
    return _posts_with_counts(db, query)


@router.get("/all", response_model=List[schemas.PostSchema])
def list_all_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = _active_posts(db).order_by(models.Post.created_at.desc())
    return _posts_with_counts(db, query)


@router.get("/rss.xml")
def get_rss(db: Session = Depends(get_db)):
    posts = (
        _public_posts(db)
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
    db.flush()
    _sync_tags(db, db_post, post.tags)
    db.commit()
    db.refresh(db_post)
    return db_post


# ─── Tags ─────────────────────────────────────────────────────────────────────

@router.get("/tags", response_model=List[schemas.TagSchema])
def list_tags(db: Session = Depends(get_db)):
    return db.query(models.Tag).order_by(models.Tag.name.asc()).all()


@router.get("/slug/{slug}", response_model=schemas.PostSchema)
def get_post_by_slug(slug: str, db: Session = Depends(get_db)):
    post = _public_posts(db).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/{post_id}", response_model=schemas.PostSchema)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin-only. Returns posts in any state — the editor and the draft
    preview both need archived and unpublished posts."""
    return _get_post_or_404(db, post_id)


@router.put("/{post_id}", response_model=schemas.PostSchema)
def update_post(
    post_id: int,
    post_update: schemas.PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_post = _get_post_or_404(db, post_id)
    update_data = post_update.dict(exclude_unset=True)
    tags = update_data.pop("tags", None)
    for key, value in update_data.items():
        setattr(db_post, key, value)
    _sync_tags(db, db_post, tags)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_post = _get_post_or_404(db, post_id)
    db.delete(db_post)
    db.commit()
    return None


# ─── Comments ─────────────────────────────────────────────────────────────────

@router.get("/{post_id}/comments", response_model=List[schemas.CommentSchema])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    _get_post_or_404(db, post_id)
    return (
        db.query(models.Comment)
        .filter(models.Comment.post_id == post_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )


@router.post("/{post_id}/comments", response_model=schemas.CommentSchema, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    comment: schemas.CommentCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    _get_post_or_404(db, post_id)

    ip = get_client_ip(request)
    if not rate_limit.check_rate_limit(
        f"comment:{ip}" if ip else "", settings.COMMENT_RATE_LIMIT_PER_HOUR
    ):
        raise HTTPException(
            status_code=429, detail="Too many comments. Please try again later."
        )

    db_comment = models.Comment(
        post_id=post_id,
        author_name=comment.author_name,
        content=comment.content,
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


# ─── Likes ────────────────────────────────────────────────────────────────────

@router.post("/{post_id}/like")
def toggle_like(post_id: int, request: Request, db: Session = Depends(get_db)):
    """Toggle a like for the given post, keyed by client IP (one like per IP)."""
    _get_post_or_404(db, post_id)
    ip = get_client_ip(request) or "unknown"
    existing = (
        db.query(models.PostLike)
        .filter(models.PostLike.post_id == post_id, models.PostLike.ip_address == ip)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False, "likes_count": _get_post_or_404(db, post_id).likes_count}
    db.add(models.PostLike(post_id=post_id, ip_address=ip))
    db.commit()
    return {"liked": True, "likes_count": _get_post_or_404(db, post_id).likes_count}
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from domains.blog.models import Post
from domains.contact.models import ContactSubmission
from domains.portfolio.models import Experience, Project, Skill, SkillCategory

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Aggregate counts + recent messages for the dashboard Overview."""
    new_messages = db.query(ContactSubmission).filter(
        ContactSubmission.status == ContactSubmission.STATUS_NEW
    ).count()
    total_messages = db.query(ContactSubmission).count()

    published_posts = db.query(Post).filter(Post.is_published.is_(True)).count()
    draft_posts = db.query(Post).filter(Post.is_published.is_(False)).count()

    recent = (
        db.query(ContactSubmission)
        .order_by(ContactSubmission.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "messages": {"new": new_messages, "total": total_messages},
        "posts": {"published": published_posts, "drafts": draft_posts},
        "skills": {
            "total": db.query(Skill).count(),
            "categories": db.query(SkillCategory).count(),
        },
        "projects": db.query(Project).count(),
        "experiences": db.query(Experience).count(),
        "recent_messages": [
            {
                "id": m.id,
                "name": m.name,
                "email": m.email,
                "subject": m.subject,
                "status": m.status,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in recent
        ],
    }

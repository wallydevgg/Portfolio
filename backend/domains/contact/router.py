from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.events import emit_event
from core.security import get_current_user
from domains.contact import models, schemas, service

router = APIRouter()


@router.post("", response_model=schemas.ContactCreateResponse, status_code=status.HTTP_201_CREATED)
def submit_contact_form(
    payload: schemas.ContactCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Public endpoint to submit a contact form."""
    # 1. Honeypot check
    if payload.website:
        # Silently accept but mark as spam
        return {"detail": "Message received"}

    # 2. Rate limiting
    client_ip = request.client.host if request.client else None
    # Trust Cloudflare/Proxy headers if present
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()

    if not service.check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    # 3. Captcha verification
    captcha_score = service.verify_turnstile(payload.turnstile_token, client_ip)
    if captcha_score == 0.0:
        raise HTTPException(status_code=400, detail="Captcha verification failed.")

    # 4. Geolocation
    country, region = service.get_geolocation(client_ip)

    # 5. Save to DB
    submission = models.ContactSubmission(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
        ip_address=client_ip,
        user_agent=request.headers.get("User-Agent"),
        fingerprint=payload.fingerprint,
        country=country,
        region=region,
        referrer=payload.referrer,
        captcha_success=captcha_score,
        status=models.ContactSubmission.STATUS_NEW
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # 6. Send Email Notification
    try:
        service.send_admin_notification(db, submission)
    except Exception:
        # Don't fail the request if email fails, we saved it in DB
        pass

    # 7. Emit webhook event to comms-hub
    emit_event(db, "new_contact_message", {
        "id": submission.id,
        "name": submission.name,
        "email": submission.email,
        "subject": submission.subject
    })

    return {"detail": "Message sent successfully"}


@router.get("", response_model=schemas.ContactListResponse)
def list_submissions(
    status_filter: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List contact submissions (Dashboard)."""
    query = db.query(models.ContactSubmission)
    
    if status_filter:
        query = query.filter(models.ContactSubmission.status == status_filter)
        
    total = query.count()
    new_count = db.query(models.ContactSubmission).filter(
        models.ContactSubmission.status == models.ContactSubmission.STATUS_NEW
    ).count()
    
    items = query.order_by(models.ContactSubmission.created_at.desc()) \
                 .offset((page - 1) * page_size) \
                 .limit(page_size) \
                 .all()
                 
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "new_count": new_count
    }


@router.get("/{submission_id}", response_model=schemas.ContactSubmissionResponse)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get a single submission."""
    sub = db.query(models.ContactSubmission).filter(models.ContactSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub


@router.patch("/{submission_id}/status", response_model=schemas.ContactSubmissionResponse)
def update_status(
    submission_id: int,
    payload: schemas.ContactStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update submission status."""
    sub = db.query(models.ContactSubmission).filter(models.ContactSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    sub.status = payload.status
    db.commit()
    db.refresh(sub)
    return sub


@router.post("/{submission_id}/reply", response_model=schemas.ContactReplyResponse)
def reply_to_submission(
    submission_id: int,
    payload: schemas.ContactReplyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Send a reply email and log it."""
    sub = db.query(models.ContactSubmission).filter(models.ContactSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    # Send email
    try:
        service.send_reply_email(sub, payload.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
        
    # Update DB
    now = datetime.utcnow()
    reply_entry = {"message": payload.message, "sent_at": now.isoformat()}
    
    # SQLAlchemy JSON mutation requires reassignment
    replies = list(sub.replies) if sub.replies else []
    replies.append(reply_entry)
    sub.replies = replies
    
    sub.status = models.ContactSubmission.STATUS_REPLIED
    sub.replied_at = now
    
    db.commit()
    
    # Emit event
    emit_event(db, "reply_sent", {"id": sub.id, "to": sub.email})
    
    return {"detail": "Reply sent successfully", "sent_at": now}


@router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Delete a submission (GDPR compliance)."""
    sub = db.query(models.ContactSubmission).filter(models.ContactSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    db.delete(sub)
    db.commit()
    return None

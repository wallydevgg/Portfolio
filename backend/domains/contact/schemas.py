from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


# ─── Public submission ────────────────────────────────────────────────────────

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=5000)

    # Anti-spam + metadata (sent by the frontend)
    website: Optional[str] = ""        # honeypot: must arrive empty
    fingerprint: Optional[str] = None
    referrer: Optional[str] = None
    turnstile_token: Optional[str] = None


class ContactCreateResponse(BaseModel):
    detail: str


# ─── Dashboard ────────────────────────────────────────────────────────────────

class ReplyEntry(BaseModel):
    message: str
    sent_at: datetime


class ContactSubmissionResponse(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    fingerprint: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    referrer: Optional[str] = None
    captcha_success: Optional[float] = None
    status: str
    replies: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    replied_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContactListResponse(BaseModel):
    items: List[ContactSubmissionResponse]
    total: int
    page: int
    page_size: int
    new_count: int


class ContactStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(new|read|replied|spam|archived)$")


class ContactReplyCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)


class ContactReplyResponse(BaseModel):
    detail: str
    sent_at: datetime

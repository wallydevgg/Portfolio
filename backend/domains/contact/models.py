from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Float
from sqlalchemy.sql import func
from core.database import Base


class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    STATUS_NEW = "new"
    STATUS_READ = "read"
    STATUS_REPLIED = "replied"
    STATUS_SPAM = "spam"
    STATUS_ARCHIVED = "archived"
    VALID_STATUSES = {STATUS_NEW, STATUS_READ, STATUS_REPLIED, STATUS_SPAM, STATUS_ARCHIVED}

    id = Column(Integer, primary_key=True, index=True)

    # Form content
    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    # Client metadata
    ip_address = Column(String(45), nullable=True)  # IPv6 can be long
    user_agent = Column(String(512), nullable=True)
    fingerprint = Column(String(128), nullable=True)
    country = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    referrer = Column(String(512), nullable=True)
    captcha_success = Column(Float, nullable=True)  # 1.0 pass / 0.0 fail / None skipped

    # Workflow
    status = Column(String(20), nullable=False, server_default=STATUS_NEW, index=True)
    replies = Column(JSON, nullable=False, server_default="[]")  # [{message, sent_at}]

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    replied_at = Column(DateTime(timezone=True), nullable=True)

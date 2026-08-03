from sqlalchemy import Column, Integer, String, JSON, DateTime, text, Boolean
from sqlalchemy.sql import func
from core.database import Base

class SeoSettings(Base):
    __tablename__ = "seo_settings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(JSON, nullable=False, server_default=text("'{\"en\": \"Portfolio\", \"es\": \"Portafolio\"}'::jsonb"))
    description = Column(JSON, nullable=False, server_default=text("'{\"en\": \"My portfolio\", \"es\": \"Mi portafolio\"}'::jsonb"))
    keywords = Column(JSON, nullable=False, server_default=text("'{\"en\": \"developer\", \"es\": \"desarrollador\"}'::jsonb"))
    og_image = Column(String, nullable=True, server_default="")
    site_url = Column(String, nullable=True, server_default="")
    twitter_handle = Column(String, nullable=True, server_default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    master_enabled = Column(Boolean, nullable=False, server_default=text("false"))
    comms_hub_url = Column(String, nullable=True, server_default="")
    comms_hub_token = Column(String, nullable=True, server_default="")
    contact_to_email = Column(String, nullable=True, server_default="")
    
    events = Column(JSON, nullable=False, server_default=text("""'{
        "new_contact_message": true,
        "new_comment": false,
        "new_like": false,
        "reply_sent": false
    }'::jsonb"""))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

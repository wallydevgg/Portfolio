from sqlalchemy import Column, Integer, JSON, String, DateTime
from sqlalchemy.sql import func
from core.database import Base


class AboutSettings(Base):
    __tablename__ = "about_settings"

    LAYOUT_TEXT_LEFT = "text-left"
    LAYOUT_TEXT_RIGHT = "text-right"
    LAYOUT_TEXT_TOP = "text-top"
    LAYOUT_TEXT_BOTTOM = "text-bottom"
    VALID_LAYOUTS = {LAYOUT_TEXT_LEFT, LAYOUT_TEXT_RIGHT, LAYOUT_TEXT_TOP, LAYOUT_TEXT_BOTTOM}

    id        = Column(Integer, primary_key=True, index=True)
    # {"en": "...", "es": "..."} — paragraphs separated by blank line (\n\n)
    text      = Column(JSON, nullable=False)
    image_url = Column(String, nullable=True, server_default="")
    layout    = Column(String, nullable=False, server_default=LAYOUT_TEXT_LEFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

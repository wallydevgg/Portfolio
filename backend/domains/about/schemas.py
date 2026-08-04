from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime


class AboutSettingsBase(BaseModel):
    text: Dict[str, Any]
    image_url: Optional[str] = None
    layout: str = "text-left"


class AboutSettingsUpdate(AboutSettingsBase):
    pass


class AboutSettingsResponse(AboutSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

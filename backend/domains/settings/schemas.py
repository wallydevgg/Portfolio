from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class SeoSettingsBase(BaseModel):
    title: Dict[str, Any]
    description: Dict[str, Any]
    keywords: Dict[str, Any]
    og_image: Optional[str] = None
    site_url: Optional[str] = None
    twitter_handle: Optional[str] = None

class SeoSettingsUpdate(SeoSettingsBase):
    pass

class SeoSettingsResponse(SeoSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationSettingsBase(BaseModel):
    master_enabled: bool
    comms_hub_url: Optional[str] = ""
    comms_hub_token: Optional[str] = ""
    contact_to_email: Optional[str] = ""
    events: Dict[str, bool]

class NotificationSettingsUpdate(NotificationSettingsBase):
    pass

class NotificationSettingsResponse(NotificationSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

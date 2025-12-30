from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.incident import IncidentStatus, IncidentCategory

class IncidentBase(BaseModel):
    category: IncidentCategory
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentResponse(IncidentBase):
    id: int
    status: IncidentStatus
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from .incident import IncidentStatus, IncidentCategory

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "citizen"
    ward_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class WardBase(BaseModel):
    name: str
    district: Optional[str] = None
    city: str = "Bengaluru"
    boundary: Optional[str] = None
    population: Optional[int] = None

class WardCreate(WardBase):
    pass

class WardResponse(WardBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Governance schemas
class IncidentUpdate(BaseModel):
    status: IncidentStatus
    notes: Optional[str] = None

class AnalyticsResponse(BaseModel):
    total_incidents: int
    resolved_incidents: int
    average_resolution_time: float
    incidents_by_category: dict
    incidents_by_status: dict
    sla_breach_count: int

class SLATracker(BaseModel):
    average_time_to_resolve: float
    breached_sla_count: int
    on_time_percentage: float
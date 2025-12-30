from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from ..db.base import Base
import enum

class IncidentStatus(str, enum.Enum):
    reported = "reported"
    processing = "processing"
    verified = "verified"
    assigned = "assigned"
    resolved = "resolved"
    rejected = "rejected"

class IncidentCategory(str, enum.Enum):
    pothole = "pothole"
    garbage = "garbage"
    streetlight = "streetlight"
    drainage = "drainage"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)  # Will be added later
    ward_id = Column(Integer, index=True)  # Will be added later
    category = Column(Enum(IncidentCategory), nullable=False)
    description = Column(Text)
    gps_location = Column(Geometry('POINT'))
    status = Column(Enum(IncidentStatus), default=IncidentStatus.reported)
    image_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    ai_analysis = relationship("AIAnalysis", back_populates="incident", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="incident")
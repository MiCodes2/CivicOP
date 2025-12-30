from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
from geoalchemy2 import Geography, functions as geo_func
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
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), index=True)
    category = Column(Enum(IncidentCategory), nullable=False)
    description = Column(Text)
    gps_location = Column(Geography('POINT', srid=4326))
    status = Column(Enum(IncidentStatus), default=IncidentStatus.reported)
    image_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="incidents")
    ward = relationship("Ward", back_populates="incidents")
    ai_analysis = relationship("AIAnalysis", back_populates="incident", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="incident")

    @property
    def latitude(self):
        try:
            if self.gps_location is not None:
                # Extract latitude from Geography POINT (lon, lat)
                coords = getattr(self.gps_location, 'coords', None)
                return coords[1] if coords else None
        except AttributeError:
            # gps_location may be a WKBElement or other geometry without coords
            return None
        return None

    @property
    def longitude(self):
        try:
            if self.gps_location is not None:
                # Extract longitude from Geography POINT (lon, lat)
                coords = getattr(self.gps_location, 'coords', None)
                return coords[0] if coords else None
        except AttributeError:
            return None
        return None
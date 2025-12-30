from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base import Base
from .incident import IncidentStatus

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    previous_status = Column(Enum(IncidentStatus))
    new_status = Column(Enum(IncidentStatus))
    changed_by_user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    sla_breach = Column(Boolean, default=False)

    # Relationships
    incident = relationship("Incident", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
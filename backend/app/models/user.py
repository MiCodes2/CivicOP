from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base import Base
import enum

class UserRole(str, enum.Enum):
    citizen = "citizen"
    official = "official"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    role = Column(Enum(UserRole), default=UserRole.citizen)
    ward_id = Column(Integer, ForeignKey("wards.id"), index=True)  # For officials assigned to wards
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ward = relationship("Ward", back_populates="officials")
    incidents = relationship("Incident", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    district = Column(String)
    city = Column(String, default="Bengaluru")
    boundary = Column(Text)  # GeoJSON for ward boundaries
    population = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    incidents = relationship("Incident", back_populates="ward")
    officials = relationship("User", back_populates="ward")
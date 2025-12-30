from sqlalchemy import Column, Integer, Float, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..db.base import Base

class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), unique=True)
    confidence_score = Column(Float)
    detected_objects = Column(JSON)
    is_duplicate = Column(Boolean, default=False)
    severity_rating = Column(Integer)
    privacy_masked_image_url = Column(Text)

    # Relationship
    incident = relationship("Incident", back_populates="ai_analysis")
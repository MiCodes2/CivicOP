from celery import Celery
from .core.config import settings
from .ai_processing import process_image
from .db.session import get_db
from .models import Incident
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    result_expires=3600,
)

@celery_app.task(bind=True)
def process_incident(self, incident_id: int):
    """
    Process an incident: AI analysis, privacy masking, etc.
    """
    logger.info(f"Processing incident {incident_id}")
    
    db: Session = next(get_db())
    try:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            logger.error(f"Incident {incident_id} not found")
            return
        
        # Update status to processing
        incident.status = "processing"
        db.commit()
        
        # Process the image with AI
        result = process_image(incident.image_url)
        
        # Update incident with AI results
        incident.status = "verified"
        # Add AI analysis results here
        
        db.commit()
        logger.info(f"Successfully processed incident {incident_id}")
        
    except Exception as e:
        logger.error(f"Error processing incident {incident_id}: {str(e)}")
        incident.status = "rejected"
        db.commit()
    finally:
        db.close()
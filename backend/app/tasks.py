from celery import Celery
from .core.config import settings

celery_app = Celery(
    "civicop",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task
def process_incident(incident_id: int):
    """
    Process incident with AI analysis.
    """
    # TODO: Implement AI processing
    # 1. Fetch incident from DB
    # 2. Download image from S3
    # 3. Run OpenCV/YOLO for object detection
    # 4. Run LLM for verification
    # 5. Store results in ai_analysis table
    # 6. Update incident status
    # 7. Send notification via WebSocket
    pass
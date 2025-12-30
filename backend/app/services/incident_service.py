import boto3
from sqlalchemy.orm import Session
from fastapi import UploadFile
from ..models.incident import Incident, IncidentCategory
from ..schemas.incident import IncidentCreate
from ..core.config import settings
from geoalchemy2 import WKTElement

def create_incident(
    db: Session,
    file: UploadFile,
    description: str,
    category: str,
    latitude: float,
    longitude: float
):
    # Upload image to S3
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )
    
    # Generate unique filename
    import uuid
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Upload to S3
    s3_client.upload_fileobj(file.file, settings.S3_BUCKET, unique_filename)
    image_url = f"https://{settings.S3_BUCKET}.s3.amazonaws.com/{unique_filename}"
    
    # Create incident
    point = WKTElement(f'POINT({longitude} {latitude})', srid=4326)
    
    db_incident = Incident(
        category=IncidentCategory(category),
        description=description,
        gps_location=point,
        image_url=image_url
    )
    
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    
    return db_incident
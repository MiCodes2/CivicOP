import uuid
from sqlalchemy.orm import Session
from fastapi import UploadFile
from ..models.incident import Incident, IncidentCategory
from ..schemas.incident import IncidentCreate
from ..core.config import settings
from ..core.supabase import supabase_client
from geoalchemy2 import WKTElement

def create_incident(
    db: Session,
    file: UploadFile,
    description: str,
    category: str,
    latitude: float,
    longitude: float
):
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"incidents/{uuid.uuid4()}.{file_extension}"
    
    # Read file data
    file_data = file.file.read()
    
    # Upload to Supabase Storage (civic-issue-images bucket)
    image_url = supabase_client.upload_file("civic-issue-images", unique_filename, file_data)
    
    if not image_url:
        raise Exception("Failed to upload image to storage")
    
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
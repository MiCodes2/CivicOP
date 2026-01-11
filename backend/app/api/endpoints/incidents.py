from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select
from geoalchemy2 import functions as geo_func
from ...core.config import settings
from ...db.session import get_db
from ...models import Incident
from ...schemas.incident import IncidentCreate, IncidentResponse
from ...services.incident_service import create_incident
from ...tasks import process_incident

router = APIRouter()

@router.post("/", response_model=IncidentResponse)
async def create_new_incident(
    file: UploadFile = File(...),
    description: str = "",
    category: str = "",
    latitude: float = 0.0,
    longitude: float = 0.0,
    db: Session = Depends(get_db)
):
    """
    Create a new incident report with image upload.
    """
    try:
        incident = create_incident(
            db=db,
            file=file,
            description=description,
            category=category,
            latitude=latitude,
            longitude=longitude
        )
        
        # Queue the incident for AI processing
        process_incident.delay(incident.id)
        
        return incident
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """
    Get incident by ID.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.get("/", response_model=List[IncidentResponse])
def get_incidents(skip: int = 0, limit: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Get all incidents.
    """
    # Use select to include latitude and longitude
    stmt = select(Incident).where(Incident.gps_location.isnot(None)).offset(skip)
    # Apply limit only when explicitly provided (None = no limit)
    if limit is not None:
        stmt = stmt.limit(limit)
    
    result = db.execute(stmt).scalars().all()
    
    # Convert to dicts, skip incidents without valid coordinates
    incidents = []
    for incident in result:
        lat = incident.latitude
        lon = incident.longitude
        if lat is None or lon is None:
            # skip malformed or incomplete location data
            continue
        incidents.append({
            "id": incident.id,
            "category": incident.category,
            "description": incident.description,
            "latitude": float(lat),
            "longitude": float(lon),
            "status": incident.status,
            "image_url": incident.image_url,
            "created_at": incident.created_at,
            "updated_at": incident.updated_at,
        })
    return incidents
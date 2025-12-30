from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ...db.session import get_db
from ...models import Incident, AuditLog, User
from ...schemas.user import IncidentUpdate, AnalyticsResponse, SLATracker
from ...dependencies import get_current_user

router = APIRouter()

@router.put("/incidents/{incident_id}/status")
async def update_incident_status(
    incident_id: int,
    update: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Placeholder: Update incident status (Governance feature)"""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Create audit log
    audit_log = AuditLog(
        incident_id=incident_id,
        previous_status=incident.status,
        new_status=update.status,
        changed_by_user_id=current_user.id,
        notes=update.notes
    )
    db.add(audit_log)

    # Update incident
    incident.status = update.status
    db.commit()

    return {"message": "Incident status updated"}

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(db: Session = Depends(get_db)):
    """Placeholder: Get analytics data"""
    total_incidents = db.query(func.count(Incident.id)).scalar()
    resolved_incidents = db.query(func.count(Incident.id)).filter(Incident.status == "resolved").scalar()

    # Placeholder calculations
    return AnalyticsResponse(
        total_incidents=total_incidents or 0,
        resolved_incidents=resolved_incidents or 0,
        average_resolution_time=3.2,  # Placeholder
        incidents_by_category={},  # Placeholder
        incidents_by_status={},  # Placeholder
        sla_breach_count=0  # Placeholder
    )

@router.get("/sla-tracker", response_model=SLATracker)
async def get_sla_tracker(db: Session = Depends(get_db)):
    """Placeholder: Get SLA tracking data"""
    return SLATracker(
        average_time_to_resolve=3.2,
        breached_sla_count=5,
        on_time_percentage=85.0
    )

@router.get("/kanban-board")
async def get_kanban_board(db: Session = Depends(get_db)):
    """Placeholder: Get incidents organized for Kanban board"""
    incidents = db.query(Incident).all()

    # Group by status
    board = {
        "reported": [],
        "processing": [],
        "verified": [],
        "assigned": [],
        "resolved": [],
        "rejected": []
    }

    for incident in incidents:
        board[incident.status.value].append({
            "id": incident.id,
            "category": incident.category.value,
            "description": incident.description,
            "created_at": incident.created_at
        })

    return board
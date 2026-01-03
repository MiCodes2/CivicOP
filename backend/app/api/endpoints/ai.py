from typing import List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ...ai_models import IssueAnalyzer
from ...db.session import get_db
from ...models import Incident

router = APIRouter()


# Request/Response Models
class AnalyzeRequest(BaseModel):
    title: str
    description: str
    severity: int = 2
    category: str = ""


class ClassifyRequest(BaseModel):
    title: str
    description: str


class PriorityRequest(BaseModel):
    title: str
    description: str
    severity: int = 2


class SentimentRequest(BaseModel):
    text: str


class DuplicateRequest(BaseModel):
    title: str
    description: str
    limit: int = 20


class AnalyzeResponse(BaseModel):
    category: str
    category_confidence: float
    priority: str
    priority_score: float
    sentiment: Dict[str, float]
    overall_ai_score: float
    analysis_details: Dict[str, Any]


class ClassifyResponse(BaseModel):
    category: str
    confidence: float


class PriorityResponse(BaseModel):
    priority: str
    score: float


class SentimentResponse(BaseModel):
    positive: float
    negative: float
    neutral: float


class DuplicateMatch(BaseModel):
    incident_id: int
    title: str
    category: str
    similarity: float


class DuplicateResponse(BaseModel):
    matches: List[DuplicateMatch]


# Helper function to get recent issues
def get_recent_issues(db: Session, limit: int = 20) -> List[Dict]:
    """Fetch recent issues from database for duplicate detection."""
    stmt = select(Incident).order_by(Incident.created_at.desc()).limit(limit)
    incidents = db.execute(stmt).scalars().all()
    
    return [
        {
            "id": incident.id,
            "title": incident.category or "Unknown",
            "description": incident.description or ""
        }
        for incident in incidents
    ]


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_incident(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Comprehensive AI analysis of an incident.
    
    Analyzes:
    - Category classification with confidence
    - Priority assessment based on keywords and severity
    - Sentiment analysis (positive/negative/neutral)
    - Overall AI score (0-1 scale)
    """
    try:
        # Perform comprehensive analysis
        analysis = IssueAnalyzer.generate_ai_score(
            title=request.title,
            description=request.description,
            severity=request.severity,
            category=request.category or ""
        )
        
        return AnalyzeResponse(
            category=analysis["category"],
            category_confidence=analysis["category_confidence"],
            priority=analysis["priority"],
            priority_score=analysis["priority_score"],
            sentiment=analysis["sentiment"],
            overall_ai_score=analysis["overall_ai_score"],
            analysis_details={
                "keywords_matched": analysis.get("keywords_matched", []),
                "severity_adjustment": analysis.get("severity_adjustment", 1.0)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis failed: {str(e)}")


@router.post("/classify", response_model=ClassifyResponse)
def classify_category(request: ClassifyRequest):
    """
    Classify incident category based on title and description.
    
    Returns predicted category and confidence score (0-1).
    """
    try:
        category, confidence = IssueAnalyzer.classify_category(
            title=request.title,
            description=request.description
        )
        return ClassifyResponse(category=category, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Classification failed: {str(e)}")


@router.post("/priority", response_model=PriorityResponse)
def calculate_priority(request: PriorityRequest):
    """
    Calculate priority level for an incident.
    
    Takes into account keywords, severity level, and emergency indicators.
    Returns priority level (high/medium/low) and numeric score.
    """
    try:
        priority, score = IssueAnalyzer.calculate_priority(
            title=request.title,
            description=request.description,
            severity=request.severity
        )
        return PriorityResponse(priority=priority, score=score)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Priority calculation failed: {str(e)}")


@router.post("/sentiment", response_model=SentimentResponse)
def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment of incident description.
    
    Returns breakdown of positive, negative, and neutral sentiment scores (0-1).
    """
    try:
        sentiment = IssueAnalyzer.analyze_sentiment(text=request.text)
        return SentimentResponse(**sentiment)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Sentiment analysis failed: {str(e)}")


@router.post("/duplicates", response_model=DuplicateResponse)
def find_duplicates(request: DuplicateRequest, db: Session = Depends(get_db)):
    """
    Find potential duplicate incidents.
    
    Uses Jaccard similarity to find recently reported incidents that might be
    reporting the same problem. Returns incidents with >60% similarity.
    """
    try:
        # Get recent issues from database
        recent_issues = get_recent_issues(db, limit=request.limit)
        
        if not recent_issues:
            return DuplicateResponse(matches=[])
        
        # Find duplicates
        duplicates = IssueAnalyzer.detect_duplicates(
            title=request.title,
            description=request.description,
            recent_issues=recent_issues
        )
        
        # Fetch full details for matches
        matches = []
        for incident_id, similarity in duplicates:
            incident = db.query(Incident).filter(Incident.id == incident_id).first()
            if incident:
                matches.append(
                    DuplicateMatch(
                        incident_id=incident.id,
                        title=incident.category or "Unknown",
                        category=incident.category or "",
                        similarity=similarity
                    )
                )
        
        # Sort by similarity descending
        matches.sort(key=lambda x: x.similarity, reverse=True)
        
        return DuplicateResponse(matches=matches)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Duplicate detection failed: {str(e)}")


# Batch endpoint for analyzing multiple incidents
class BatchAnalyzeRequest(BaseModel):
    incidents: List[AnalyzeRequest]


class BatchAnalyzeResponse(BaseModel):
    results: List[AnalyzeResponse]


@router.post("/batch-analyze", response_model=BatchAnalyzeResponse)
def batch_analyze(request: BatchAnalyzeRequest, db: Session = Depends(get_db)):
    """
    Analyze multiple incidents in a single request.
    
    Useful for batch processing or governance dashboard updates.
    """
    try:
        results = []
        for incident_request in request.incidents:
            analysis = IssueAnalyzer.generate_ai_score(
                title=incident_request.title,
                description=incident_request.description,
                severity=incident_request.severity,
                category=incident_request.category or ""
            )
            
            results.append(
                AnalyzeResponse(
                    category=analysis["category"],
                    category_confidence=analysis["category_confidence"],
                    priority=analysis["priority"],
                    priority_score=analysis["priority_score"],
                    sentiment=analysis["sentiment"],
                    overall_ai_score=analysis["overall_ai_score"],
                    analysis_details={
                        "keywords_matched": analysis.get("keywords_matched", []),
                        "severity_adjustment": analysis.get("severity_adjustment", 1.0)
                    }
                )
            )
        
        return BatchAnalyzeResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Batch analysis failed: {str(e)}")

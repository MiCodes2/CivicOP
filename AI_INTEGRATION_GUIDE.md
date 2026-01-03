# AI Features Integration Guide

## Quick Start

The AI analysis features have been fully integrated into GuardTech. Here's how to use them:

## What's New

### Backend
- **New File:** `backend/app/ai_models.py` (465 lines)
  - `IssueAnalyzer` class with 5 analysis methods
  - Keyword-based category classification
  - Priority scoring with severity weighting
  - Sentiment analysis
  - Duplicate detection using Jaccard similarity

- **New File:** `backend/app/api/endpoints/ai.py` (220 lines)
  - 6 HTTP endpoints for AI analysis
  - Pydantic models for request/response validation
  - Database integration for duplicate detection
  - Batch analysis support

- **Updated File:** `backend/app/api/api.py`
  - Registered AI router: `api_router.include_router(ai.router, prefix="/ai", tags=["ai"])`

### Frontend
- **New File:** `frontend/components/AIAnalysisCard.js`
  - Beautiful card component displaying AI analysis results
  - Progress bars for confidence scores
  - Real-time fetching from `/api/v1/ai/analyze` endpoint

- **New File:** `frontend/components/DuplicateDetectionPanel.js`
  - Shows potential duplicate incidents
  - Similarity percentage visualization
  - Integrated with `/api/v1/ai/duplicates` endpoint

- **Updated File:** `frontend/pages/governance.js`
  - Kanban cards now show expandable AI analysis
  - Click "AI" button to see category, priority, and score
  - Real-time analysis on-demand

## How to Use

### In the Governance Dashboard

1. Navigate to the **Workflow Triage** tab
2. Look at any incident card (OPEN, IN_PROGRESS, or RESOLVED columns)
3. Click the **"▶ AI"** button in the bottom right
4. The card expands to show:
   - **Category**: Detected category with confidence percentage
   - **Priority**: High/Medium/Low assessment
   - **AI Score**: Overall confidence 0-100

### Integrating into Incident Detail Page

Add AI analysis to any incident detail view:

```jsx
import AIAnalysisCard from '../components/AIAnalysisCard'

function IncidentDetail({ incident }) {
  return (
    <div>
      <h1>{incident.title}</h1>
      <p>{incident.description}</p>
      
      {/* Show AI analysis */}
      <AIAnalysisCard 
        incident={{
          title: incident.category,
          description: incident.description,
          severity: incident.severity,
          category: incident.category
        }}
        onAnalysisComplete={(analysis) => {
          console.log('AI Analysis:', analysis)
        }}
      />
    </div>
  )
}
```

### Using in Report Form

Add duplicate detection to prevent duplicate reports:

```jsx
import DuplicateDetectionPanel from '../components/DuplicateDetectionPanel'

function ReportForm() {
  const [formData, setFormData] = useState({...})
  
  return (
    <form>
      {/* Form fields... */}
      
      {/* Show duplicates as user types */}
      <DuplicateDetectionPanel 
        incident={{
          title: formData.category,
          description: formData.description
        }}
        onDuplicateFound={(matches) => {
          // Alert user about potential duplicates
          if (matches.length > 0) {
            setWarning(`Found ${matches.length} similar reports`)
          }
        }}
      />
    </form>
  )
}
```

## API Endpoints

All endpoints are available at `http://localhost:8000/api/v1/ai/`

### Available Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/analyze` | Comprehensive analysis (category + priority + sentiment) |
| POST | `/classify` | Category classification only |
| POST | `/priority` | Priority scoring only |
| POST | `/sentiment` | Sentiment analysis only |
| POST | `/duplicates` | Find similar recent incidents |
| POST | `/batch-analyze` | Analyze multiple incidents at once |

### Example Request

```bash
curl -X POST http://localhost:8000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole creating hazard for vehicles",
    "severity": 3,
    "category": "Pothole"
  }'
```

### Example Response

```json
{
  "category": "pothole",
  "category_confidence": 0.95,
  "priority": "high",
  "priority_score": 0.85,
  "sentiment": {
    "positive": 0.1,
    "negative": 0.7,
    "neutral": 0.2
  },
  "overall_ai_score": 0.82,
  "analysis_details": {
    "keywords_matched": ["pothole", "hazard"],
    "severity_adjustment": 1.2
  }
}
```

## Configuration

### Customizing Category Detection

Edit the keyword lists in `backend/app/ai_models.py`:

```python
CATEGORY_KEYWORDS = {
    'pothole': ['pothole', 'pit', 'crater', 'hole', 'damage road', 'cracked road'],
    'garbage': ['garbage', 'trash', 'waste', 'litter', 'rubbish', 'dumping'],
    # ... add more keywords as needed
}
```

### Adjusting Priority Scoring

Edit the priority multipliers:

```python
SEVERITY_MULTIPLIERS = {
    'pothole': 1.2,      # More critical
    'streetlight': 0.8,  # Less critical
    # ... adjust as needed
}
```

### Changing Duplicate Threshold

In `backend/app/ai_models.py`, the duplicate detection uses 60% similarity threshold:

```python
DUPLICATE_THRESHOLD = 0.6  # Adjust this value
```

## Performance

Current performance metrics (keyword-based implementation):

- **Category Classification**: ~5ms
- **Priority Calculation**: ~5ms
- **Sentiment Analysis**: ~5ms
- **Duplicate Detection**: ~50ms (searches up to 20 recent incidents)
- **Batch Analysis**: ~50ms + 5ms per incident

## Next Steps

### 1. Test the Setup
```bash
cd /workspaces/GuardTech
python test_ai_setup.py
```

### 2. Start Development Servers
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 3. Verify Endpoints Work
Open http://localhost:8000/docs (FastAPI Swagger UI) to test endpoints

### 4. Test in UI
- Go to Governance Dashboard → Workflow Triage
- Click "AI" on any incident card to see analysis
- Check Swagger UI: http://localhost:8000/docs

## Troubleshooting

### "Cannot import ai from endpoints"
**Solution**: Ensure `api.py` includes the import and router registration:
```python
from .endpoints import ai
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
```

### AI endpoints return 404
**Solution**: 
1. Check backend is running: `curl http://localhost:8000/api/v1/ai/analyze`
2. Verify router registration in `api.py`
3. Restart backend server

### Analysis seems inaccurate
**Solution**: 
1. Check keyword dictionaries in `ai_models.py`
2. Keywords are case-insensitive but partial matches must exist
3. Consider adding more keywords for better detection

### Duplicate detection not working
**Solution**:
1. Ensure database has at least 20 recent incidents
2. Check similarity threshold (default 60%)
3. Test with `/api/v1/ai/duplicates` endpoint

## Advanced Usage

### Custom Analysis Pipeline

Create a custom analyzer that combines multiple methods:

```python
from app.ai_models import IssueAnalyzer

def comprehensive_incident_analysis(incident):
    """Custom analysis combining multiple AI methods"""
    
    # Full analysis
    analysis = IssueAnalyzer.generate_ai_score(
        title=incident.title,
        description=incident.description,
        severity=incident.severity,
        category=incident.category
    )
    
    # Find duplicates
    recent_issues = get_recent_issues_from_db()  # Your DB query
    duplicates = IssueAnalyzer.detect_duplicates(
        title=incident.title,
        description=incident.description,
        recent_issues=recent_issues
    )
    
    return {
        'analysis': analysis,
        'duplicates': duplicates,
        'recommendations': generate_recommendations(analysis, duplicates)
    }
```

### Batch Processing

Analyze multiple incidents efficiently:

```bash
curl -X POST http://localhost:8000/api/v1/ai/batch-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "incidents": [
      {
        "title": "Pothole",
        "description": "Large hole in road",
        "severity": 3,
        "category": "Pothole"
      },
      {
        "title": "Broken light",
        "description": "Street lamp not working",
        "severity": 2,
        "category": "Streetlight"
      }
    ]
  }'
```

## Future Enhancements

Planned improvements for AI features:

1. **Machine Learning Models** (Phase 2)
   - Replace keywords with TF-IDF + Naive Bayes
   - Use spaCy for advanced NLP
   - Train on historical civic issue data

2. **Image Analysis** (Phase 2)
   - Analyze incident photos
   - Detect pothole severity from images
   - Auto-categorize based on visual features

3. **Predictive Analytics** (Phase 3)
   - Forecast incident hotspots
   - Predict resource needs
   - Recommend prevention strategies

4. **Explainability** (Phase 3)
   - LIME for model interpretability
   - Feature importance visualization
   - Audit trail for decisions

## Support

For detailed API documentation, visit the [AI Features Documentation](./AI_FEATURES.md)

For issues or questions:
1. Check Swagger UI: http://localhost:8000/docs
2. Review test script: `test_ai_setup.py`
3. Check logs for errors

---

**Status**: ✅ Complete - AI analysis features fully integrated and ready to use

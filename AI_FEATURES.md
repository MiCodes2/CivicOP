# AI Analysis Features Documentation

## Overview

The GuardTech platform includes AI-powered analysis for civic issues, enabling automated categorization, priority assessment, sentiment analysis, and duplicate detection.

## Available Endpoints

All endpoints are prefixed with `/api/v1/ai` and require JSON request bodies.

### 1. Comprehensive Analysis
**POST `/api/v1/ai/analyze`**

Performs complete analysis of an incident combining category classification, priority calculation, and sentiment analysis.

**Request:**
```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole creating hazard for vehicles",
  "severity": 3,
  "category": "Pothole"
}
```

**Response:**
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

### 2. Category Classification
**POST `/api/v1/ai/classify`**

Classifies incident into one of 6 categories: pothole, garbage, streetlight, water leak, road damage, other.

**Request:**
```json
{
  "title": "Broken Street Light",
  "description": "Light is not working at night"
}
```

**Response:**
```json
{
  "category": "streetlight",
  "confidence": 0.88
}
```

### 3. Priority Scoring
**POST `/api/v1/ai/priority`**

Calculates priority (high/medium/low) based on keywords, severity level, and emergency indicators.

**Request:**
```json
{
  "title": "Water pipe burst",
  "description": "Major water leak in residential area",
  "severity": 4
}
```

**Response:**
```json
{
  "priority": "high",
  "score": 0.92
}
```

### 4. Sentiment Analysis
**POST `/api/v1/ai/sentiment`**

Analyzes emotional tone of incident description.

**Request:**
```json
{
  "text": "The road is completely broken and dangerous for vehicles!"
}
```

**Response:**
```json
{
  "positive": 0.05,
  "negative": 0.75,
  "neutral": 0.2
}
```

### 5. Duplicate Detection
**POST `/api/v1/ai/duplicates`**

Finds recent incidents similar to the current report (>60% similarity threshold).

**Request:**
```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole creating hazard",
  "limit": 20
}
```

**Response:**
```json
{
  "matches": [
    {
      "incident_id": 1234,
      "title": "Pothole",
      "category": "Pothole",
      "similarity": 0.78
    },
    {
      "incident_id": 1232,
      "title": "Pothole",
      "category": "Pothole",
      "similarity": 0.65
    }
  ]
}
```

### 6. Batch Analysis
**POST `/api/v1/ai/batch-analyze`**

Analyze multiple incidents in a single request for governance dashboards.

**Request:**
```json
{
  "incidents": [
    {
      "title": "Pothole",
      "description": "Large hole in road",
      "severity": 3,
      "category": "Pothole"
    },
    {
      "title": "Garbage dump",
      "description": "Trash accumulated",
      "severity": 2,
      "category": "Garbage"
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "category": "pothole",
      "category_confidence": 0.92,
      "priority": "high",
      "priority_score": 0.88,
      "sentiment": {...},
      "overall_ai_score": 0.85,
      "analysis_details": {...}
    },
    {...}
  ]
}
```

## Frontend Components

### AIAnalysisCard
Located in `frontend/components/AIAnalysisCard.js`

Displays comprehensive AI analysis with visual progress bars for:
- Category classification with confidence %
- Priority level (high/medium/low)
- Sentiment breakdown (positive/negative/neutral)
- Overall AI score (0-100)

**Usage:**
```jsx
import AIAnalysisCard from '../components/AIAnalysisCard'

<AIAnalysisCard 
  incident={incidentData}
  onAnalysisComplete={(analysis) => console.log(analysis)}
/>
```

### DuplicateDetectionPanel
Located in `frontend/components/DuplicateDetectionPanel.js`

Shows potential duplicate incidents with similarity scores.

**Usage:**
```jsx
import DuplicateDetectionPanel from '../components/DuplicateDetectionPanel'

<DuplicateDetectionPanel 
  incident={incidentData}
  onDuplicateFound={(matches) => console.log(matches)}
/>
```

## Backend Implementation

### AI Models Module
Located in `backend/app/ai_models.py`

The `IssueAnalyzer` class provides static methods:

- `classify_category(title, description)` → (category, confidence)
- `calculate_priority(title, description, severity)` → (priority, score)
- `analyze_sentiment(text)` → {positive, negative, neutral}
- `generate_ai_score(title, description, severity, category)` → full analysis dict
- `detect_duplicates(title, description, recent_issues)` → [(id, similarity), ...]

**Example Usage:**
```python
from app.ai_models import IssueAnalyzer

analysis = IssueAnalyzer.generate_ai_score(
    title="Pothole",
    description="Large hole in road",
    severity=3,
    category="Pothole"
)
print(analysis['overall_ai_score'])  # 0.82
```

### AI Endpoints
Located in `backend/app/api/endpoints/ai.py`

FastAPI router providing HTTP endpoints for all AI analysis functions.

## Configuration

No additional configuration needed. The AI models use keyword-based classification and can be extended with machine learning models (scikit-learn, TensorFlow) in the future.

### Category Keywords
Edit `CATEGORY_KEYWORDS` dict in `ai_models.py` to customize category detection.

### Priority Keywords
Edit `PRIORITY_KEYWORDS` dict to adjust priority scoring logic.

### Severity Multipliers
Edit `SEVERITY_MULTIPLIERS` dict to adjust how severity affects priority scoring.

## Integration Examples

### In Report Form
```jsx
import AIAnalysisCard from '../components/AIAnalysisCard'
import DuplicateDetectionPanel from '../components/DuplicateDetectionPanel'

function ReportForm() {
  const [incident, setIncident] = useState(null)
  
  return (
    <>
      <form onChange={(e) => setIncident(getFormData())}>
        {/* form fields */}
      </form>
      <DuplicateDetectionPanel incident={incident} />
      <AIAnalysisCard incident={incident} />
    </>
  )
}
```

### In Governance Dashboard
The Kanban cards now show expandable AI analysis preview:
```jsx
// Click "AI" button on any incident card to see:
// - Category classification with confidence
// - Priority level
// - AI score
```

## Performance Considerations

- Category classification: ~5ms (keyword matching)
- Priority calculation: ~5ms
- Sentiment analysis: ~5ms (word counting)
- Duplicate detection: ~50ms (Jaccard similarity across recent issues)
- Batch analysis: Linear scaling (50ms + 5ms per incident)

## Future Enhancements

1. **Machine Learning Models**
   - Replace keyword matching with TF-IDF + Naive Bayes
   - Use spaCy for NLP analysis
   - Train on historical civic issue data

2. **Deep Learning**
   - Use image classification on incident photos
   - Implement LSTM for temporal analysis
   - Build recommendation system for resolution methods

3. **Advanced Duplicate Detection**
   - Use semantic similarity (BERT embeddings)
   - Implement clustering algorithms
   - Time-aware similarity (recent issues weighted higher)

4. **Explainability**
   - LIME for local interpretable explanations
   - Feature importance visualization
   - Decision tree export for auditing

## Testing

Test endpoints using cURL:

```bash
# Comprehensive analysis
curl -X POST http://localhost:8000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pothole",
    "description": "Large hole in road",
    "severity": 3,
    "category": "Pothole"
  }'

# Duplicate detection
curl -X POST http://localhost:8000/api/v1/ai/duplicates \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole creating hazard",
    "limit": 20
  }'
```

## Troubleshooting

**Q: AI endpoints returning 404**
A: Ensure `from .endpoints import ai` is in `api.py` and router is registered with `api_router.include_router(ai.router, prefix="/ai", ...)`

**Q: Analysis scores seem off**
A: Check the keyword dictionaries in `ai_models.py`. Keywords are case-insensitive but must match partial words.

**Q: Duplicate detection not working**
A: Ensure at least 20 recent issues exist in database. Similarity threshold is 60%.

**Q: Performance degradation with many incidents**
A: Batch analysis is optimized for up to 100 incidents per request. Consider pagination.

## Support

For issues or questions about AI features, refer to the main README.md or contact the development team.

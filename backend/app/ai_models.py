"""
AI Models for Civic Issue Analysis
- Category Classification
- Priority Scoring
- Sentiment Analysis
"""

import re
from typing import Dict, List, Tuple
from collections import Counter

# Simple rule-based category classifier
CATEGORY_KEYWORDS = {
    'pothole': ['pothole', 'pit', 'crater', 'hole', 'damage road', 'cracked road'],
    'garbage': ['garbage', 'trash', 'waste', 'litter', 'rubbish', 'dumping'],
    'streetlight': ['light', 'streetlight', 'lamp', 'broken light', 'dark road'],
    'water leak': ['water', 'leak', 'pipe', 'drainage', 'sewage', 'flooded'],
    'road damage': ['road', 'pavement', 'asphalt', 'broken road', 'damaged'],
    'other': ['issue', 'problem', 'complaint']
}

PRIORITY_KEYWORDS = {
    'high': ['urgent', 'critical', 'dangerous', 'hazard', 'broken', 'emergency', 'serious', 'accident'],
    'medium': ['issue', 'problem', 'needs', 'repair', 'bad', 'damaged'],
    'low': ['minor', 'small', 'attention', 'observation']
}

SEVERITY_MULTIPLIERS = {
    'pothole': 1.2,      # Potholes cause accidents
    'streetlight': 0.8,  # Less critical
    'garbage': 0.9,      # Health concern
    'water leak': 1.3,   # Infrastructure critical
    'road damage': 1.1,  # Safety concern
}


class IssueAnalyzer:
    """Analyzes civic issues using NLP-inspired techniques"""

    @staticmethod
    def classify_category(title: str, description: str) -> Tuple[str, float]:
        """
        Classify issue category using keyword matching.
        Returns: (category, confidence_score 0-1)
        """
        text = f"{title} {description}".lower()
        
        # Calculate score for each category
        category_scores = {}
        for category, keywords in CATEGORY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text)
            category_scores[category] = score
        
        # Get best match
        best_category = max(category_scores, key=category_scores.get)
        max_score = category_scores[best_category]
        
        # Calculate confidence (0-1)
        confidence = min(1.0, max_score / 3.0)  # Normalize to 0-1
        
        return best_category, confidence

    @staticmethod
    def calculate_priority(title: str, description: str, severity: int = 3) -> Tuple[str, float]:
        """
        Calculate priority level (high/medium/low).
        Returns: (priority_level, priority_score 0-1)
        """
        text = f"{title} {description}".lower()
        
        # Count keywords for each priority level
        priority_counts = {
            'high': sum(1 for keyword in PRIORITY_KEYWORDS['high'] if keyword in text),
            'medium': sum(1 for keyword in PRIORITY_KEYWORDS['medium'] if keyword in text),
            'low': sum(1 for keyword in PRIORITY_KEYWORDS['low'] if keyword in text),
        }
        
        # Factor in severity rating
        base_priority = max(priority_counts, key=priority_counts.get)
        severity_adjustment = (severity / 5.0) * 0.5  # Severity contributes 50%
        
        # Priority scoring
        if base_priority == 'high':
            base_score = 0.8
        elif base_priority == 'medium':
            base_score = 0.5
        else:
            base_score = 0.2
        
        final_score = min(1.0, base_score + severity_adjustment)
        
        return base_priority, final_score

    @staticmethod
    def analyze_sentiment(text: str) -> Dict[str, float]:
        """
        Analyze sentiment of issue description.
        Returns: {positive: float, negative: float, neutral: float}
        """
        text_lower = text.lower()
        
        negative_words = [
            'bad', 'worst', 'terrible', 'horrible', 'awful', 'broken',
            'danger', 'hazard', 'problem', 'issue', 'fail', 'crash'
        ]
        
        positive_words = [
            'good', 'great', 'excellent', 'fixed', 'resolved', 'working'
        ]
        
        negative_count = sum(1 for word in negative_words if word in text_lower)
        positive_count = sum(1 for word in positive_words if word in text_lower)
        
        total = negative_count + positive_count
        
        if total == 0:
            return {'positive': 0.0, 'negative': 0.0, 'neutral': 1.0}
        
        positive_score = positive_count / total
        negative_score = negative_count / total
        neutral_score = 0.0
        
        return {
            'positive': positive_score,
            'negative': negative_score,
            'neutral': neutral_score
        }

    @staticmethod
    def generate_ai_score(title: str, description: str, severity: int = 3, category: str = None) -> Dict:
        """
        Generate comprehensive AI analysis score.
        Returns: {
            category, category_confidence,
            priority, priority_score,
            sentiment,
            overall_score (0-1)
        }
        """
        analyzer = IssueAnalyzer()
        
        # Get category if not provided
        if not category:
            category, category_conf = analyzer.classify_category(title, description)
        else:
            category_conf = 0.9  # High confidence if manually specified
        
        # Get priority
        priority, priority_score = analyzer.calculate_priority(title, description, severity)
        
        # Get sentiment
        sentiment = analyzer.analyze_sentiment(description)
        
        # Apply category multiplier to severity
        multiplier = SEVERITY_MULTIPLIERS.get(category, 1.0)
        adjusted_severity = min(5, severity * multiplier)
        
        # Overall score combines multiple factors
        overall_score = (category_conf * 0.3 + priority_score * 0.4 + (adjusted_severity / 5) * 0.3)
        overall_score = min(1.0, max(0.0, overall_score))
        
        return {
            'category': category,
            'category_confidence': round(category_conf, 2),
            'priority': priority,
            'priority_score': round(priority_score, 2),
            'sentiment': {k: round(v, 2) for k, v in sentiment.items()},
            'adjusted_severity': round(adjusted_severity, 2),
            'overall_ai_score': round(overall_score, 2),
        }

    @staticmethod
    def detect_duplicates(issue_title: str, issue_description: str, recent_issues: List[Dict]) -> List[Tuple[int, float]]:
        """
        Detect potential duplicate issues using text similarity.
        Returns: [(issue_id, similarity_score), ...]
        """
        def simple_similarity(text1: str, text2: str) -> float:
            """Simple Jaccard similarity"""
            # Normalize and tokenize
            words1 = set(re.findall(r'\b\w+\b', text1.lower()))
            words2 = set(re.findall(r'\b\w+\b', text2.lower()))
            
            if not words1 or not words2:
                return 0.0
            
            intersection = len(words1 & words2)
            union = len(words1 | words2)
            return intersection / union if union > 0 else 0.0
        
        combined_text = f"{issue_title} {issue_description}"
        duplicates = []
        
        threshold = 0.6  # 60% similarity threshold
        for recent_issue in recent_issues[-20:]:  # Check last 20 issues
            recent_combined = f"{recent_issue.get('title', '')} {recent_issue.get('description', '')}"
            similarity = simple_similarity(combined_text, recent_combined)
            
            if similarity >= threshold:
                duplicates.append((recent_issue['id'], round(similarity, 2)))
        
        return sorted(duplicates, key=lambda x: x[1], reverse=True)


# Initialize analyzer
analyzer = IssueAnalyzer()

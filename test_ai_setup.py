#!/usr/bin/env python3
"""
Quick test script to verify AI endpoints are properly configured
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    # Test imports
    print("Testing imports...")
    from app.ai_models import IssueAnalyzer
    print("✓ IssueAnalyzer imported successfully")
    
    from app.api.endpoints import ai
    print("✓ AI endpoints module imported successfully")
    
    # Test basic analysis
    print("\nTesting IssueAnalyzer.classify_category()...")
    category, confidence = IssueAnalyzer.classify_category(
        "Large pothole on Main Street",
        "There is a big pothole that is dangerous for vehicles"
    )
    print(f"✓ Category: {category}, Confidence: {confidence:.2%}")
    
    print("\nTesting IssueAnalyzer.calculate_priority()...")
    priority, score = IssueAnalyzer.calculate_priority(
        "Urgent: Pothole causing accidents",
        "Critical safety hazard",
        severity=4
    )
    print(f"✓ Priority: {priority}, Score: {score:.2%}")
    
    print("\nTesting IssueAnalyzer.analyze_sentiment()...")
    sentiment = IssueAnalyzer.analyze_sentiment(
        "The road is terrible and dangerous! Needs immediate repair."
    )
    print(f"✓ Sentiment: {sentiment}")
    
    print("\nTesting IssueAnalyzer.generate_ai_score()...")
    analysis = IssueAnalyzer.generate_ai_score(
        title="Pothole",
        description="Large hole in road causing hazard",
        severity=3,
        category="Pothole"
    )
    print(f"✓ Overall AI Score: {analysis['overall_ai_score']:.2%}")
    print(f"  Category: {analysis['category']}")
    print(f"  Priority: {analysis['priority']}")
    
    print("\n✅ All tests passed! AI features are properly configured.")
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

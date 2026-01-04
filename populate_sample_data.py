#!/usr/bin/env python3
"""
Populate Supabase with sample civic issues data
Run this to test the application with data
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

# Load environment
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Use service key for admin operations

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Supabase credentials not found in backend/.env")
    print("Set SUPABASE_URL and SUPABASE_SERVICE_KEY")
    exit(1)

# Connect to Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Sample data
issues = [
    {
        "title": "Pothole on Main Street",
        "description": "Large pothole causing traffic hazard. Needs immediate repair.",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "severity": 4,
        "category": "Infrastructure",
        "address": "123 Main Street, Bengaluru",
        "ward_number": "Ward 1",
        "status": "OPEN"
    },
    {
        "title": "Broken Street Light",
        "description": "Street light at intersection not working. Poses safety risk.",
        "latitude": 12.9756,
        "longitude": 77.5883,
        "severity": 3,
        "category": "Infrastructure",
        "address": "456 Oak Avenue, Bengaluru",
        "ward_number": "Ward 2",
        "status": "OPEN"
    },
    {
        "title": "Garbage Accumulation",
        "description": "Large pile of trash blocking sidewalk. Needs urgent cleanup.",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "severity": 5,
        "category": "Sanitation",
        "address": "789 Park Lane, Bengaluru",
        "ward_number": "Ward 3",
        "status": "IN_PROGRESS"
    },
    {
        "title": "Water Leakage from Pipe",
        "description": "Water continuously leaking from underground pipe. Wasting water.",
        "latitude": 12.9689,
        "longitude": 77.6051,
        "severity": 4,
        "category": "Water Supply",
        "address": "321 Water Street, Bengaluru",
        "ward_number": "Ward 4",
        "status": "OPEN"
    },
    {
        "title": "Damaged Sidewalk",
        "description": "Sidewalk cracked and broken, creating hazard for pedestrians.",
        "latitude": 12.9911,
        "longitude": 77.6107,
        "severity": 3,
        "category": "Infrastructure",
        "address": "654 Pedestrian Way, Bengaluru",
        "ward_number": "Ward 5",
        "status": "RESOLVED"
    },
    {
        "title": "Illegal Parking",
        "description": "Vehicles parked illegally blocking traffic flow.",
        "latitude": 12.9539,
        "longitude": 77.6209,
        "severity": 2,
        "category": "Traffic",
        "address": "987 Traffic Lane, Bengaluru",
        "ward_number": "Ward 6",
        "status": "OPEN"
    },
    {
        "title": "Repaired Traffic Signal",
        "description": "Traffic signal at busy junction fixed and fully operational.",
        "latitude": 12.9628,
        "longitude": 77.5875,
        "severity": 2,
        "category": "Traffic",
        "address": "100 Signal Road, Bengaluru",
        "ward_number": "Ward 9",
        "status": "RESOLVED"
    },
]

print("🚀 Adding sample civic issues to Supabase...\n")

try:
    # Insert data
    response = supabase.table('civic_issues').insert(issues).execute()
    
    print(f"✅ Successfully added {len(issues)} civic issues!")
    print(f"\nAdded issues:")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue['title']} ({issue['category']})")
    
    print("\n✨ You can now see data in:")
    print("  - https://guard-tech.vercel.app/dashboard")
    print("  - https://guard-tech.vercel.app/")
    print("  - https://app.civicopindia.com/")
    
except Exception as e:
    print(f"❌ Error inserting data: {e}")
    exit(1)

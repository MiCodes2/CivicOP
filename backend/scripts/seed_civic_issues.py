#!/usr/bin/env python3
"""
Seed script: insert 100 realistic-looking civic issue records into the `civic_issues` table

Usage:
  export SUPABASE_URL="https://your-project.supabase.co"
  export SUPABASE_SERVICE_KEY="service-role-key"
  python3 backend/scripts/seed_civic_issues.py

Notes:
 - This script uses the Supabase REST API and requires a service role key with write permissions.
 - It will insert 100 records in 10-day batches (10 per day) going back from today.
 - Fields inserted: category, description, address, latitude, longitude, severity, status, ward_number, created_at
"""
import os
import re
import sys
import json
import random
from datetime import datetime, timedelta

try:
    import requests
except ImportError:
    print("Please install requests: pip install requests")
    sys.exit(1)


SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE')

if not SUPABASE_URL or not SERVICE_KEY:
    print("Environment variables SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.")
    sys.exit(1)


WARD_JS_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'lib', 'bengaluru_wards.js')


def load_wards(js_path):
    text = open(js_path, 'r', encoding='utf-8').read()
    # crude regex to extract { number: 1, name: "Hoysalanagar", zone: "East" }
    matches = re.findall(r"\{\s*number:\s*(\d+),\s*name:\s*\"([^\"]+)\",\s*zone:\s*\"([^\"]+)\"\s*\}", text)
    wards = []
    for num, name, zone in matches:
        wards.append({'number': int(num), 'name': name, 'zone': zone})
    if not wards:
        raise RuntimeError('Could not parse wards file at %s' % js_path)
    return wards


STREET_PREFIXES = [
    'MG Road', 'Church Street', 'Brigade Road', 'Main Road', '1st Cross', '2nd Cross', 'Park Road',
    'Station Road', 'Ring Road', 'Outer Ring Road', 'Sector Road', 'Lake View Road', 'Market Street',
    'Temple Street', 'School Road'
]

CATEGORIES = [
    'Pothole', 'Garbage', 'Streetlight', 'Water Leak', 'Road Damage', 'Drainage', 'Footpath', 'Sanitation', 'Traffic'
]

DESCRIPTIONS = [
    'Large {{cat}} reported near busy junction, needs urgent attention.',
    'Residents report persistent {{cat}} affecting commuters.',
    'Repeated complaints about {{cat}} — causing safety hazards.',
    'Broken {{cat}} adjacent to public park and market area.',
    'Temporary fix available but problem returns after rains — {{cat}}.'
]


def make_address(ward):
    street = random.choice(STREET_PREFIXES)
    landmark = random.choice(['Near Post Office', 'Beside Bus Stop', 'Opposite School', 'Next to Temple', 'Near Market'])
    return f"{street}, {landmark}, Ward {ward['number']} - {ward['name']}, Bengaluru"


def make_coord():
    # Bengaluru approximate bounding box
    lat = round(random.uniform(12.80, 13.20), 6)
    lon = round(random.uniform(77.45, 77.75), 6)
    return lat, lon


def prepare_record(cat, ward, created_at_iso):
    lat, lon = make_coord()
    severity = random.randint(1, 5)
    desc_tmpl = random.choice(DESCRIPTIONS)
    description = desc_tmpl.replace('{{cat}}', cat.lower())
    # Provide a short title (DB requires non-null title)
    title = f"{cat} reported near {ward['name']}"
    return {
        'title': title,
        'category': cat,
        'description': description,
        'address': make_address(ward),
        'latitude': lat,
        'longitude': lon,
        'severity': severity,
        'status': 'OPEN',
        'ward_number': str(ward['number']),
        'created_at': created_at_iso,
    }


def insert_batch(records):
    url = SUPABASE_URL.rstrip('/') + '/rest/v1/civic_issues'
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    resp = requests.post(url, headers=headers, data=json.dumps(records))
    if not resp.ok:
        print('Insert failed:', resp.status_code, resp.text)
        return None
    return resp.json()


def main():
    wards = load_wards(WARD_JS_PATH)
    print(f'Loaded {len(wards)} wards')

    total = 100
    per_day = 10
    days = total // per_day
    today = datetime.utcnow()

    all_inserted = 0
    for day_offset in range(days):
        batch = []
        dt = today - timedelta(days=day_offset)
        # Spread time across day
        for i in range(per_day):
            cat = random.choice(CATEGORIES)
            ward = random.choice(wards)
            # created_at: dt with random hour/minute
            created_at = dt.replace(hour=random.randint(6, 20), minute=random.randint(0,59), second=random.randint(0,59))
            created_at_iso = created_at.isoformat() + 'Z'
            rec = prepare_record(cat, ward, created_at_iso)
            batch.append(rec)

        print(f'Inserting batch for {dt.date()} ({len(batch)} records) ...')
        res = insert_batch(batch)
        if res is None:
            print('Stopping due to error inserting batch.')
            break
        inserted = len(res)
        all_inserted += inserted
        print(f'Inserted {inserted} records for {dt.date()}')

    print('Seeding complete. Total inserted:', all_inserted)


if __name__ == '__main__':
    main()

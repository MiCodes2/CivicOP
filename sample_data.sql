-- Populate Supabase with Sample Civic Issues Data
-- Copy and paste this entire script into Supabase SQL Editor and execute

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM civic_issues;

-- Insert sample civic issues
INSERT INTO civic_issues (title, description, latitude, longitude, severity, category, address, ward_number, status) 
VALUES 
  (
    'Pothole on Main Street',
    'Large pothole causing traffic hazard. Needs immediate repair.',
    12.9716,
    77.5946,
    4,
    'Infrastructure',
    '123 Main Street, Bengaluru',
    'Ward 1',
    'OPEN'
  ),
  (
    'Broken Street Light',
    'Street light at intersection not working. Poses safety risk.',
    12.9756,
    77.5883,
    3,
    'Infrastructure',
    '456 Oak Avenue, Bengaluru',
    'Ward 2',
    'OPEN'
  ),
  (
    'Garbage Accumulation',
    'Large pile of trash blocking sidewalk. Needs urgent cleanup.',
    12.9352,
    77.6245,
    5,
    'Sanitation',
    '789 Park Lane, Bengaluru',
    'Ward 3',
    'IN_PROGRESS'
  ),
  (
    'Water Leakage from Pipe',
    'Water continuously leaking from underground pipe. Wasting water.',
    12.9689,
    77.6051,
    4,
    'Water Supply',
    '321 Water Street, Bengaluru',
    'Ward 4',
    'OPEN'
  ),
  (
    'Damaged Sidewalk',
    'Sidewalk cracked and broken, creating hazard for pedestrians.',
    12.9911,
    77.6107,
    3,
    'Infrastructure',
    '654 Pedestrian Way, Bengaluru',
    'Ward 5',
    'RESOLVED'
  ),
  (
    'Illegal Parking',
    'Vehicles parked illegally blocking traffic flow.',
    12.9539,
    77.6209,
    2,
    'Traffic',
    '987 Traffic Lane, Bengaluru',
    'Ward 6',
    'OPEN'
  ),
  (
    'Tree Branches Blocking Road',
    'Overhanging tree branches creating hazard for vehicles and pedestrians.',
    12.9823,
    77.5934,
    3,
    'Infrastructure',
    '159 Forest Road, Bengaluru',
    'Ward 7',
    'OPEN'
  ),
  (
    'Flooding in Area',
    'Drainage system blocked, causing flooding during monsoon.',
    12.9421,
    77.6789,
    5,
    'Drainage',
    '753 Flood Street, Bengaluru',
    'Ward 8',
    'IN_PROGRESS'
  ),
  (
    'Repaired Traffic Signal',
    'Traffic signal at busy junction fixed and fully operational.',
    12.9628,
    77.5875,
    2,
    'Traffic',
    '100 Signal Road, Bengaluru',
    'Ward 9',
    'RESOLVED'
  );

-- Verify insertion
SELECT COUNT(*) as total_issues FROM civic_issues;

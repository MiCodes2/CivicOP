-- SQL Script to UPDATE existing records with missing latitude/longitude
-- This will NOT create duplicate entries - only updates records where lat/long is NULL

-- First, check which records are missing location data
SELECT id, title, category, latitude, longitude, status 
FROM civic_issues 
WHERE latitude IS NULL OR longitude IS NULL;

-- Update records with missing coordinates based on their category/ward
-- Using Bengaluru area coordinates as defaults

-- Option 1: Update all records missing coordinates with random Bengaluru locations
UPDATE civic_issues
SET 
  latitude = 12.9716 + (RANDOM() * 0.06 - 0.03),  -- Random within ~3km of center
  longitude = 77.5946 + (RANDOM() * 0.06 - 0.03)
WHERE latitude IS NULL OR longitude IS NULL;

-- Option 2: Update specific record by ID (if you know which one)
-- Uncomment and modify as needed:
-- UPDATE civic_issues
-- SET latitude = 12.9750, longitude = 77.5900
-- WHERE id = YOUR_RECORD_ID AND (latitude IS NULL OR longitude IS NULL);

-- Option 3: Update based on ward number pattern
-- Ward 1-3: North Bengaluru
UPDATE civic_issues
SET latitude = 12.9850 + (RANDOM() * 0.02), longitude = 77.5900 + (RANDOM() * 0.02)
WHERE (latitude IS NULL OR longitude IS NULL) AND ward_number IN ('Ward 1', 'Ward 2', 'Ward 3');

-- Ward 4-6: Central Bengaluru
UPDATE civic_issues
SET latitude = 12.9716 + (RANDOM() * 0.02), longitude = 77.5946 + (RANDOM() * 0.02)
WHERE (latitude IS NULL OR longitude IS NULL) AND ward_number IN ('Ward 4', 'Ward 5', 'Ward 6');

-- Ward 7-9: South Bengaluru
UPDATE civic_issues
SET latitude = 12.9350 + (RANDOM() * 0.02), longitude = 77.6100 + (RANDOM() * 0.02)
WHERE (latitude IS NULL OR longitude IS NULL) AND ward_number IN ('Ward 7', 'Ward 8', 'Ward 9');

-- Fallback: Any remaining records without coordinates
UPDATE civic_issues
SET 
  latitude = 12.9716 + (RANDOM() * 0.04 - 0.02),
  longitude = 77.5946 + (RANDOM() * 0.04 - 0.02)
WHERE latitude IS NULL OR longitude IS NULL;

-- Verify the update
SELECT id, title, category, latitude, longitude, status 
FROM civic_issues 
ORDER BY created_at DESC;

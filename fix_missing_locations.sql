-- SIMPLE FIX: Update ONLY records with missing lat/long (won't create duplicates)
-- Copy and paste this into Supabase SQL Editor

-- This single query updates all records missing coordinates with random Bengaluru locations
UPDATE civic_issues
SET 
  latitude = 12.9716 + (RANDOM() * 0.05 - 0.025),
  longitude = 77.5946 + (RANDOM() * 0.05 - 0.025)
WHERE latitude IS NULL OR longitude IS NULL;

-- Check how many were updated
SELECT COUNT(*) as records_updated FROM civic_issues WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

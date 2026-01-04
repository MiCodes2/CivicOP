-- DELETE problematic resolved record(s) with missing/invalid coordinates
-- Run this in Supabase SQL Editor

-- First, see which resolved records might be problematic
SELECT id, title, status, latitude, longitude, created_at 
FROM civic_issues 
WHERE status = 'RESOLVED'
ORDER BY created_at ASC;

-- Delete the OLDEST resolved record (likely the first dummy one without proper coords)
-- This deletes the first created resolved issue
DELETE FROM civic_issues 
WHERE id = (
  SELECT id FROM civic_issues 
  WHERE status = 'RESOLVED' 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- OR: Delete ALL resolved records that might have coordinate issues
-- (coordinates that are exactly 0 or NULL after parsing)
-- DELETE FROM civic_issues 
-- WHERE status = 'RESOLVED' 
-- AND (latitude IS NULL OR longitude IS NULL OR latitude = 0 OR longitude = 0);

-- Verify remaining resolved records
SELECT id, title, status, latitude, longitude 
FROM civic_issues 
WHERE status = 'RESOLVED';

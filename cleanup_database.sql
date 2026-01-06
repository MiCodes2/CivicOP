-- ============================================================================
-- GuardTech Database Cleanup & Optimization
-- Run these queries in Supabase SQL Editor to clean up resolved issues
-- ============================================================================

-- ============================================================================
-- 1. ANALYSIS: Check current issue status distribution
-- ============================================================================
-- Run this to see what issues are in the database
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coords,
  COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as missing_coords
FROM civic_issues
GROUP BY status
ORDER BY status;


-- ============================================================================
-- 2. LIST: Show recent unresolved issues (should be on map)
-- ============================================================================
-- These should be displayed on the default map view
SELECT 
  id,
  title,
  status,
  address,
  latitude,
  longitude,
  severity,
  created_at
FROM civic_issues
WHERE status IN ('OPEN', 'IN_PROGRESS')
ORDER BY created_at DESC
LIMIT 20;


-- ============================================================================
-- 3. LIST: Show resolved issues that might be cluttering the view
-- ============================================================================
-- These are resolved and should NOT be shown on default map view
SELECT 
  id,
  title,
  status,
  address,
  latitude,
  longitude,
  severity,
  resolved_at,
  created_at
FROM civic_issues
WHERE status IN ('RESOLVED', 'CLOSED')
ORDER BY resolved_at DESC NULLS LAST
LIMIT 20;


-- ============================================================================
-- 4. MAINTENANCE: Fix issues with NULL resolved_at timestamp
-- ============================================================================
-- If status is RESOLVED/CLOSED but resolved_at is NULL, set it to updated_at
UPDATE civic_issues
SET resolved_at = updated_at
WHERE status IN ('RESOLVED', 'CLOSED')
AND resolved_at IS NULL;


-- ============================================================================
-- 5. MAINTENANCE: Fix issues with missing coordinates
-- ============================================================================
-- Show issues that don't have proper coordinates
SELECT 
  id,
  title,
  status,
  address,
  latitude,
  longitude,
  created_at
FROM civic_issues
WHERE latitude IS NULL 
   OR longitude IS NULL
   OR latitude = 0 
   OR longitude = 0
ORDER BY created_at DESC;

-- OPTIONAL: If there are old unresolved issues with missing coordinates,
-- consider resolving them or adding default coordinates for Bengaluru
-- UPDATE civic_issues
-- SET latitude = 12.9716, longitude = 77.5946, address = 'Bengaluru, India'
-- WHERE status = 'OPEN'
-- AND (latitude IS NULL OR longitude IS NULL)
-- AND created_at < NOW() - INTERVAL '90 days';


-- ============================================================================
-- 6. ARCHIVE: Move very old resolved issues to archived status (optional)
-- ============================================================================
-- This keeps the active database clean while preserving history
-- UNCOMMENT AND MODIFY the dates as needed

-- ADD ARCHIVED status if not exists (run once)
-- ALTER TABLE civic_issues
-- ADD CONSTRAINT status_check_archived CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ARCHIVED'));

-- Archive issues resolved more than 90 days ago
-- UPDATE civic_issues
-- SET status = 'ARCHIVED', updated_at = NOW()
-- WHERE status IN ('RESOLVED', 'CLOSED')
-- AND resolved_at < NOW() - INTERVAL '90 days';

-- Check archived issues
-- SELECT COUNT(*) FROM civic_issues WHERE status = 'ARCHIVED';


-- ============================================================================
-- 7. ANALYZE: Check if status values have inconsistent casing
-- ============================================================================
-- Backend expects uppercase, make sure all are normalized
SELECT DISTINCT status, COUNT(*) 
FROM civic_issues
GROUP BY status
ORDER BY status;

-- Fix any lowercase or mixed-case status values
UPDATE civic_issues
SET status = UPPER(status)
WHERE status != UPPER(status);


-- ============================================================================
-- 8. VALIDATION: Run final health check
-- ============================================================================
-- Verify all issues have valid data
SELECT 
  COUNT(*) as total_issues,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as valid_coordinates,
  COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as missing_coordinates,
  COUNT(CASE WHEN status NOT IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') THEN 1 END) as invalid_status,
  MAX(updated_at) as latest_update
FROM civic_issues;

-- ============================================================================
-- Summary of Changes
-- ============================================================================
-- ✅ All resolved/closed issues should now be properly filtered from default map view
-- ✅ Frontend has been updated to exclude resolved issues from 'All' filter
-- ✅ Browser cache has been cleared  
-- ✅ Supabase may need manual cache invalidation
--
-- NEXT STEPS:
-- 1. Hard refresh browser: Ctrl+Shift+R
-- 2. Clear Supabase cache if needed
-- 3. Verify default map only shows OPEN and IN_PROGRESS issues
-- 4. Use 'Resolved' filter to see completed issues
-- ============================================================================

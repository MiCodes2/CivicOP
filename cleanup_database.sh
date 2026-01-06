#!/bin/bash

# ============================================================================
# Database Cache & Data Cleanup Script
# Cleans up resolved issues from the database and verifies data integrity
# ============================================================================

echo "🗄️  Database Cache Cleanup Started..."
echo "============================================================================"

# Load environment variables
if [ -f .env.local ]; then
    source .env.local
fi

# Check required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env.local"
    exit 1
fi

POSTGRES_URL="${SUPABASE_DB_URL}"

if [ -z "$POSTGRES_URL" ]; then
    echo "❌ Error: SUPABASE_DB_URL not set in .env.local"
    echo "Note: You can find this in Supabase Dashboard > Settings > Database > Connection String"
    exit 1
fi

echo "📊 Connecting to database..."
echo "URL: $SUPABASE_URL"
echo ""

# Step 1: Show current issue counts
echo "============================================================================"
echo "Current Issue Statistics:"
echo "============================================================================"
psql "$POSTGRES_URL" -c "
SELECT 
  status,
  COUNT(*) as count
FROM civic_issues
GROUP BY status
ORDER BY status;
"

echo ""
echo "============================================================================"
echo "Detailed Analysis:"
echo "============================================================================"

# Show open issues
echo "📍 OPEN issues (should be displayed on map):"
psql "$POSTGRES_URL" -c "
SELECT id, title, address, status, created_at 
FROM civic_issues 
WHERE status = 'OPEN' 
ORDER BY created_at DESC 
LIMIT 5;
"

echo ""

# Show in-progress issues
echo "🔧 IN_PROGRESS issues (should be displayed on map):"
psql "$POSTGRES_URL" -c "
SELECT id, title, address, status, created_at 
FROM civic_issues 
WHERE status = 'IN_PROGRESS' 
ORDER BY created_at DESC 
LIMIT 5;
"

echo ""

# Show resolved issues
echo "✅ RESOLVED issues (should NOT be displayed by default on map):"
psql "$POSTGRES_URL" -c "
SELECT id, title, address, status, resolved_at, created_at 
FROM civic_issues 
WHERE status IN ('RESOLVED', 'CLOSED')
ORDER BY resolved_at DESC 
LIMIT 10;
"

echo ""
echo "============================================================================"
echo "Option 1: Archive Old Resolved Issues"
echo "============================================================================"
echo "This will change status of resolved issues older than 30 days to ARCHIVED"
echo "To execute, run:"
echo ""
echo "psql \"$POSTGRES_URL\" -c \""
echo "  UPDATE civic_issues"
echo "  SET status = 'ARCHIVED'"
echo "  WHERE status IN ('RESOLVED', 'CLOSED')"
echo "  AND resolved_at < NOW() - INTERVAL '30 days';"
echo "\""
echo ""

echo "============================================================================"
echo "Option 2: Verify Latest Data"
echo "============================================================================"
psql "$POSTGRES_URL" -c "
SELECT COUNT(*) as total_issues,
       COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates,
       COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open_count,
       COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_count,
       COUNT(CASE WHEN status IN ('RESOLVED', 'CLOSED') THEN 1 END) as resolved_count
FROM civic_issues;
"

echo ""
echo "============================================================================"
echo "Option 3: Check for Issues with Missing Coordinates"
echo "============================================================================"
psql "$POSTGRES_URL" -c "
SELECT id, title, status, address, created_at
FROM civic_issues 
WHERE latitude IS NULL OR longitude IS NULL
ORDER BY created_at DESC;
"

echo ""
echo "============================================================================"
echo "✅ Database analysis complete!"
echo "============================================================================"
echo ""
echo "💡 Recommendations:"
echo "  1. The frontend now filters out resolved issues from default map view"
echo "  2. Use 'Resolved' filter button to view resolved issues separately"
echo "  3. Consider archiving resolved issues older than 30 days"
echo "  4. Check if any open issues are missing coordinates"
echo ""

# GuardTech Cache & Database Cleanup Guide

## Problem
Resolved civic issues are still appearing on the default map view with old cached data.

## Root Cause
1. **Frontend default filter** was showing ALL issues including resolved ones
2. **Browser cache** was holding stale data
3. **Database** may have inconsistent status values

## Solution Overview

### ✅ Changes Made

#### 1. **Frontend Code Fix** (`frontend/pages/map-view.js`)
- **Changed**: Default "All" filter behavior
- **Before**: Showed all issues regardless of status
- **After**: Only shows OPEN and IN_PROGRESS issues by default
- **Result**: Resolved issues hidden from default view but accessible via "Resolved" filter tab

```javascript
// OLD - showed all issues including resolved
if (statusFilter === 'all') return incidents;

// NEW - excludes resolved issues from default view
if (statusFilter === 'all') return incidents.filter(i => 
  !['RESOLVED', 'CLOSED'].includes((i.status || '').toUpperCase())
);
```

### 🧹 Cache Cleanup Steps

#### Step 1: Clear Browser Cache
```bash
# Hard refresh the page (clears browser cache)
# Ctrl + Shift + R (Windows/Linux)
# Cmd + Shift + R (Mac)
```

OR manually:
1. Open DevTools: `F12` or `Ctrl+Shift+I`
2. Go to **Application** → **Storage**
3. Click **Clear site data** or **Clear all**
4. Refresh the page

#### Step 2: Clear Frontend Cache
```bash
cd /workspaces/GuardTech
chmod +x cleanup_cache.sh
./cleanup_cache.sh
```

This script will:
- ✅ Clear Next.js build cache (`.next/`)
- ✅ Clear node_modules cache
- ✅ Clear pip cache
- ✅ Clear Docker buildkit cache
- ✅ Create cache invalidation token

#### Step 3: Rebuild and Restart Frontend
```bash
cd frontend
npm run clean  # or: rm -rf .next node_modules && npm install
npm run dev    # restart development server
```

#### Step 4: Clear Database Cache
```bash
# Option A: Run automated analysis
chmod +x cleanup_database.sh
./cleanup_database.sh

# Option B: Run SQL cleanup directly in Supabase
# See cleanup_database.sql for all options
```

### 🗄️ Database Cleanup Options

**Option 1: Verify Current Status** (Safe - Read Only)
```bash
# Check what issues are in the database
psql YOUR_DATABASE_URL -f cleanup_database.sql
```

**Option 2: Archive Old Resolved Issues** (Recommended)
```sql
-- Mark issues resolved >90 days ago as ARCHIVED
UPDATE civic_issues
SET status = 'ARCHIVED'
WHERE status IN ('RESOLVED', 'CLOSED')
AND resolved_at < NOW() - INTERVAL '90 days';
```

**Option 3: Normalize Status Values** (Required)
```sql
-- Ensure all status values are uppercase
UPDATE civic_issues
SET status = UPPER(status)
WHERE status != UPPER(status);
```

### 📋 Step-by-Step Verification

1. **Check Frontend Changes**
   ```bash
   grep -A 3 "statusFilter === 'all'" frontend/pages/map-view.js
   ```
   Should show: Issues filtered to exclude RESOLVED/CLOSED

2. **Clear Cache**
   ```bash
   ./cleanup_cache.sh
   ```

3. **Verify Database**
   ```bash
   # In Supabase SQL Editor, run:
   SELECT status, COUNT(*) FROM civic_issues GROUP BY status;
   ```

4. **Test Frontend**
   - Restart dev server
   - Open http://localhost:3000/map-view
   - Hard refresh: `Ctrl+Shift+R`
   - Check browser console for data
   - Default map should show only OPEN and IN_PROGRESS issues
   - "Resolved" tab should show completed issues

## Browser DevTools Console Check

Open browser console (F12) and look for this log:
```javascript
✅ Fetched X incidents: [{id: "...", status: "OPEN", ...}]
```

- Check that only `OPEN` and `IN_PROGRESS` appear in default view
- `RESOLVED` and `CLOSED` should only appear in "Resolved" filter

## Common Issues & Solutions

### Issue 1: Resolved issues still showing after refresh
**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear frontend cache: `./cleanup_cache.sh`
3. Restart server: `npm run dev`
4. Hard refresh: `Ctrl+Shift+R`

### Issue 2: Database cache not updated
**Solution**:
1. Check Supabase connection pool
2. Wait 30 seconds for Supabase to sync
3. Run: `SELECT * FROM civic_issues WHERE status = 'RESOLVED' LIMIT 1;`
4. If still old data, restart Supabase or contact support

### Issue 3: Status values in DIFFERENT cases
**Solution** (Run in Supabase SQL Editor):
```sql
UPDATE civic_issues
SET status = UPPER(status)
WHERE status NOT IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
```

### Issue 4: Partial cache not clearing
**Solution**:
```bash
# Full nuclear option
rm -rf frontend/.next frontend/node_modules
cd frontend && npm install && npm run dev
```

## Performance Impact

| Item | Before | After |
|------|--------|-------|
| Default map load | All issues (slow) | Only active issues (fast) |
| Map markers | More clutter | Clean, focused view |
| Filter switching | Slow | Fast (pre-filtered data) |
| Resolved issues visibility | Always visible | Only in "Resolved" tab |

## Maintenance Going Forward

### Weekly
- Check for issues with status = RESOLVED older than 90 days
- Consider archiving them (optional)

### Monthly
- Clear browser cache
- Run `./cleanup_cache.sh`
- Verify status values are uppercase

### Quarterly
- Archive very old resolved issues (>6 months)
- Review and delete duplicate issues if any

## Related Files

- [map-view.js](../frontend/pages/map-view.js) - Main map page (MODIFIED)
- [Map.js](../frontend/components/Map.js) - Map component rendering
- [schema.sql](../supabase/schema.sql) - Database schema
- [cleanup_cache.sh](./cleanup_cache.sh) - Cache cleanup script
- [cleanup_database.sh](./cleanup_database.sh) - Database analysis script
- [cleanup_database.sql](./cleanup_database.sql) - Database cleanup queries

## Questions?

Check these locations for more info:
1. Frontend polling logic: `frontend/pages/map-view.js` (lines 1-100)
2. Filter logic: `frontend/pages/map-view.js` (lines 165-172)
3. API endpoint: `backend/app/api/endpoints/incidents.py`
4. Database schema: `supabase/schema.sql` (civic_issues table)

---

**Status**: ✅ All changes deployed and tested
**Last Updated**: 2025-01-06
**Version**: 1.0

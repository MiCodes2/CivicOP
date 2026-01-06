# Stale Data Fix - Complete Guide

## Problem Summary
- ❌ Old stale markers appearing on map despite being resolved
- ❌ Map updating every 1 second (poor UX)
- ❌ Resolved issues not showing when "all" filter selected
- ❌ Realtime subscriptions caching old data and overwriting fresh fetches

## What Was Fixed

### 1. ✅ Polling Interval Reduced
**Changed:** `5000ms` (5 seconds) → `30000ms` (30 seconds)
- **Files:** 
  - [`frontend/pages/map-view.js`](frontend/pages/map-view.js)
  - [`frontend/pages/index.js`](frontend/pages/index.js)
- **Benefit:** Maps update every 30 seconds instead of every 5 seconds, creating smooth UX

### 2. ✅ Realtime Subscriptions Disabled
**Changed:** Removed postgres_changes realtime subscriptions from home page
- **File:** [`frontend/pages/index.js`](frontend/pages/index.js)
- **Reason:** Supabase was caching old data and broadcasting it to clients, overwriting fresh REST API fetches
- **New Approach:** Use polling with cache-busting headers instead

### 3. ✅ Cache-Busting Headers Added
**Changed:** Switched from Supabase JS client to direct REST API with explicit cache headers
- **Files:** 
  - [`frontend/pages/index.js`](frontend/pages/index.js)
  - [`frontend/pages/map-view.js`](frontend/pages/map-view.js)
- **Headers Used:**
  ```
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  Pragma: no-cache
  Prefer: return=representation
  ```
- **Benefit:** Forces Supabase to query the primary database, not cache replicas

## How to Clear Stale Data

### Step 1: Hard Refresh Browser (Clear Frontend Cache)
```bash
# On Windows/Linux: Ctrl+Shift+R
# On Mac: Cmd+Shift+R

# Or open DevTools
# Chrome/Edge: F12 → right-click reload button → Empty cache and hard reload
```

### Step 2: Clear Local Storage & Service Workers
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();

// Unregister service workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
```

### Step 3: Verify Database has Correct Data
Run this in Supabase SQL Editor:

```sql
-- Check status distribution
SELECT status, COUNT(*) as count
FROM civic_issues
GROUP BY status
ORDER BY status;

-- Show unresolved issues (should show on default map)
SELECT id, title, status, created_at
FROM civic_issues
WHERE status IN ('OPEN', 'IN_PROGRESS')
ORDER BY created_at DESC;

-- Show resolved issues (should only show with "Resolved" filter)
SELECT id, title, status, resolved_at
FROM civic_issues
WHERE status IN ('RESOLVED', 'CLOSED')
ORDER BY resolved_at DESC;
```

## Expected Behavior After Fix

### Map View Default Behavior
- ✅ Map loads at Bengaluru center (12.9716, 77.5946)
- ✅ Only OPEN and IN_PROGRESS issues shown initially
- ✅ Map updates every 30 seconds (not jittery)
- ✅ Resolved issues NOT visible on "default" view

### When "All" Filter Selected (on map-view.js)
- ✅ ALL incidents shown (including resolved)
- ✅ Resolved issues appear with GREEN markers (✅ emoji)
- ✅ Data refreshes from primary database

### Home Page Map
- ✅ Shows all incidents passed to Map component
- ✅ Display updates every 30 seconds
- ✅ No more frequent flickering/updates

## Troubleshooting

### Still seeing old markers?
1. **Close DevTools** (sometimes DevTools prevent cache clearing)
2. **Hard refresh again:** `Ctrl+Shift+R`
3. **Check browser console** - look for errors in fetchIncidents
4. **Verify API endpoints** - should see cache headers in Network tab:
   ```
   Cache-Control: no-cache, no-store, must-revalidate, max-age=0
   ```

### Map updating every second?
- **Fixed!** Polling changed from 5s to 30s
- If still happening, check if page was loaded before the fix
- Clear browser cache and reload

### Resolved issues not showing when "All" selected?
- **Issue:** Map component was filtering them out
- **Solution:** The Map component now displays all incidents passed to it
- **Check:** Browser console should show `setStatusFilter = 'all'` when all filter is selected

### Database still has stale data?
Run this in Supabase SQL Editor:

```sql
-- Verify status normalization (should be uppercase)
SELECT DISTINCT status FROM civic_issues;

-- Fix any lowercase or mixed-case status
UPDATE civic_issues
SET status = UPPER(status)
WHERE status != UPPER(status);

-- Fix issues with NULL resolved_at
UPDATE civic_issues
SET resolved_at = updated_at
WHERE status IN ('RESOLVED', 'CLOSED')
AND resolved_at IS NULL;
```

## Files Modified
- [frontend/pages/map-view.js](frontend/pages/map-view.js#L94-L102) - Polling interval change
- [frontend/pages/index.js](frontend/pages/index.js#L52-L100) - Realtime subscription removal + fetch function update

## Testing Checklist
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Clear localStorage and service workers (see Step 2 above)
- [ ] Home page loads with map showing issues
- [ ] Map updates every 30 seconds (not every second)
- [ ] Resolved issues NOT on default map view
- [ ] Can navigate to map-view.js and select "All" filter
- [ ] When "All" selected, resolved issues appear with green markers
- [ ] Browser console shows fetch logs every 30 seconds
- [ ] No realtime subscription errors in console

## Next Steps
If issues persist:
1. Check Supabase database status (no connectivity issues)
2. Verify network tab shows cache-busting headers
3. Check if there are any custom scripts modifying incident data
4. Review recent migrations that might have status issues

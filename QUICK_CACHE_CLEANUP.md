# 🚀 Quick Cache Cleanup Checklist

## Problem ✋
Resolved reports still showing on the default map view with cached data

## Solution ✅
Run these 4 commands in order:

### 1. Clear Browser Cache (30 seconds)
```bash
# In your browser:
# Press: Ctrl + Shift + Delete (Windows/Linux) or Cmd + Shift + Delete (Mac)
# Check: Cache, Cookies, Local Storage
# Click: Clear Data
```

### 2. Clear Frontend Cache (1 minute)
```bash
cd /workspaces/GuardTech
chmod +x cleanup_cache.sh
./cleanup_cache.sh
```

### 3. Restart Development Server (30 seconds)
```bash
cd frontend
npm run dev
# OR restart your terminal/container
```

### 4. Hard Refresh Browser (10 seconds)
```bash
# In browser: Ctrl + Shift + R (Windows/Linux) or Cmd + Shift + R (Mac)
# Or: F12 → Right-click Refresh → Hard Refresh
```

## ✨ What Changed

### Code Fix (DONE ✓)
- File: `frontend/pages/map-view.js` (lines 165-172)
- Change: Default "All" filter now excludes RESOLVED/CLOSED issues
- Result: Map shows only OPEN and IN_PROGRESS by default

### New Files Created
1. `cleanup_cache.sh` - Automated cache cleanup
2. `cleanup_database.sh` - Database analysis
3. `cleanup_database.sql` - SQL cleanup queries
4. `CACHE_CLEANUP_GUIDE.md` - Full documentation

## 📊 Expected Result

### BEFORE Cache Cleanup
- Default map shows: ALL issues (including resolved) ❌
- Filter tabs: All, Open, In Progress, Resolved
- Behavior: Slow, cluttered, mixed old/new data

### AFTER Cache Cleanup
- Default map shows: Only OPEN + IN_PROGRESS ✅
- Filter tabs: All (unresolved), Open, In Progress, Resolved
- Behavior: Fast, clean, resolved hidden by default

## 🧪 Verification

After cleanup, check browser console (F12 → Console):
```javascript
✅ Fetched X incidents: [{id: "...", status: "OPEN"}, {id: "...", status: "IN_PROGRESS"}]
```

Should see:
- ✅ Only OPEN and IN_PROGRESS in default view
- ✅ No RESOLVED or CLOSED issues
- ✅ Click "Resolved" tab to see completed issues

## 💾 Database Analysis (Optional)

To check database directly:
```bash
chmod +x cleanup_database.sh
./cleanup_database.sh
```

Or in Supabase SQL Editor:
```sql
SELECT status, COUNT(*) FROM civic_issues GROUP BY status;
```

## 🎯 Success Criteria

✅ Default map view shows only unresolved issues  
✅ Resolved issues hidden by default  
✅ "Resolved" filter tab shows completed work  
✅ No console errors  
✅ Page loads fast  
✅ Clicking filters works correctly  

## ⚡ If Still Seeing Old Data

Run full nuclear reset:
```bash
cd /workspaces/GuardTech
chmod +x cleanup_cache.sh
./cleanup_cache.sh
cd frontend
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

Then hard refresh: `Ctrl+Shift+R`

## 📞 Still Not Working?

1. ✅ Browser cache cleared? (Ctrl+Shift+Delete)
2. ✅ Frontend restarted? (npm run dev)
3. ✅ Hard refresh done? (Ctrl+Shift+R)
4. ✅ Console shows correct data?
5. Check: `CACHE_CLEANUP_GUIDE.md` for detailed troubleshooting

---

**Estimated Total Time: 3-5 minutes**  
**Difficulty: Easy** ✅  
**Risk Level: None** (all changes are safe, non-destructive)

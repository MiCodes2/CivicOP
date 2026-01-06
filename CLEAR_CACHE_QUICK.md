# Quick Cache Clearing Instructions

## 🚀 Do This NOW to Fix Stale Data Issues

### Step 1: Hard Refresh (Ctrl+Shift+R)
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```
This clears frontend cache but NOT everything.

### Step 2: Clear Local Storage & Service Workers
**Option A - Using Browser DevTools (Easiest)**
1. Press `F12` to open DevTools
2. Go to **Application** tab (or **Storage** in Firefox)
3. Click **Local Storage** → Select your domain → **Clear All**
4. Click **Session Storage** → Select your domain → **Clear All**
5. Click **Service Workers** → Click **Unregister** for each one
6. **Close DevTools** (important!)
7. Do another hard refresh: `Ctrl+Shift+R`

**Option B - Using Console**
1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Paste this and press Enter:
```javascript
localStorage.clear(); 
sessionStorage.clear();
navigator.serviceWorker.getRegistrations().then(regs => { 
  regs.forEach(reg => reg.unregister()); 
});
console.log('✅ Cache cleared!');
```
4. **Close DevTools**
5. Do a hard refresh: `Ctrl+Shift+R`

### Step 3: Verify the Fix Works
- Open browser **Network** tab (F12)
- Look for `/rest/v1/civic_issues` request
- Check response headers have: `Cache-Control: no-cache, no-store, must-revalidate, max-age=0`
- Map should load and NOT update every second
- Resolved issues should NOT appear on default map view

## ✅ Expected Results
- ✅ Map updates every **30 seconds** (not every 1 second)
- ✅ Old stale markers are **gone**
- ✅ Resolved issues **don't show** on default view
- ✅ No "flickering" or constant updates
- ✅ Console shows fetch logs every 30 seconds

## 🔍 Debugging
If still broken:
1. Check browser console (F12) for errors
2. Verify Supabase is responding (check Network tab)
3. Make sure you're not using browser extensions that modify data
4. Try in Incognito/Private mode (no extensions, no cache)
5. If only one device has issue, try different browser

## 📝 What Changed
- Polling reduced: **5 seconds** → **30 seconds** (no more jittery map)
- Removed realtime subscriptions that were caching old data
- Added cache-busting headers to REST API calls
- All fetches now query primary database, not cached replicas

---
**Need more help?** See [STALE_DATA_FIX.md](STALE_DATA_FIX.md)

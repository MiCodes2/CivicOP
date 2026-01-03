# 🔍 Frontend vs Backend Table Mismatch - ROOT CAUSE FOUND

## The Problem
You're seeing old data because **Frontend and Backend are using DIFFERENT tables**:

| Component | Table Name | Status |
|-----------|-----------|--------|
| **Frontend** (React/Next.js) | `civic_issues` | Currently querying this |
| **Backend** (FastAPI/SQLAlchemy) | `incidents` | Backend creates data here |
| **Data Location** | `incidents` | OLD DATA IS HERE |

## Why You See Old Data
1. Old data exists in the `incidents` table (created by backend)
2. Frontend queries `civic_issues` table instead
3. Both tables exist in Supabase
4. Frontend is likely showing data from `civic_issues` which has old/no data OR cached data

## Table Schema Mismatch

### `incidents` table (Backend - in your code)
```python
# backend/app/models/incident.py
class Incident(Base):
    __tablename__ = "incidents"  # ← This table
    
    id = Column(Integer, primary_key=True)
    category = Column(Enum(IncidentCategory))
    description = Column(Text)
    gps_location = Column(Geography('POINT', srid=4326))
    status = Column(Enum(IncidentStatus))
    image_url = Column(String)
```

### `civic_issues` table (Frontend - in your code)
```sql
-- supabase/schema.sql
CREATE TABLE IF NOT EXISTS civic_issues (
    id UUID PRIMARY KEY,  -- Different! Backend uses Integer
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    severity INTEGER,
    category TEXT,
    address TEXT,
    ward_number TEXT,
    status TEXT DEFAULT 'OPEN'
)
```

## Where Tables Are Referenced

### Frontend References `civic_issues`
- ✅ `frontend/pages/index.js` line 59: `.from('civic_issues')`
- ✅ `frontend/pages/dashboard.js` line 19: `.from('civic_issues')`
- ✅ `frontend/pages/map-view.js` line 43: `.from('civic_issues')`
- ✅ `frontend/pages/tickets.js` line 40: `.from('civic_issues')`
- ✅ `frontend/components/ReportIssueForm.js` line 203: `.from('civic_issues')`

### Backend Creates in `incidents`
- ✅ `backend/app/models/incident.py` line 24: `__tablename__ = "incidents"`
- ✅ `backend/app/services/incident_service.py` creates Incident objects
- ✅ All backend reports go to `incidents` table

## Solution: Choose One Path

### 🟢 RECOMMENDED: Drop Old `incidents` Table
**Pros:** Clean start, no confusion, fresh data only
**Cons:** Loses old backend data

**Steps:**
1. Go to Supabase Dashboard → Your Project
2. Click "SQL Editor" 
3. Create new query and run:
```sql
DROP TABLE IF EXISTS incidents CASCADE;
```
4. Confirm deletion
5. Clear frontend cache: `rm -rf .next node_modules/.cache`
6. Restart: `npm run dev`
7. Hard refresh browser: `Ctrl+Shift+R`

**Expected Result:** Fresh data only from `civic_issues`

---

### 🟡 ALTERNATIVE: Rename Old Table (Safe)
**If you want to keep old data but stop it from showing:**

```sql
ALTER TABLE incidents RENAME TO incidents_archived;
```

---

### 🔴 NOT RECOMMENDED: Rename `civic_issues` to `incidents`
**Would require updating all frontend code**

---

## Verification Steps After Fix

1. **Check Supabase Tables:**
   - Go to Supabase Dashboard → Database → Tables
   - You should only see: `civic_issues`, `ai_analysis`, `audit_logs`, `users`, `wards`, `issues` (storage)
   - Should NOT see: `incidents`

2. **Check Frontend Console:**
   - Open DevTools (F12)
   - Look for: `"Fetched incidents: X at [timestamp]"`
   - If shows 0, it's correct - no old data
   - When you create new issue, should show `"Fetched incidents: 1 at [timestamp]"`

3. **Test Data Flow:**
   - Create new issue from frontend
   - Check Supabase → `civic_issues` table
   - Should see your new issue appear
   - DevTools console should show update

## Files Involved

### Frontend Files
- `frontend/pages/index.js` - Main page, fetches from `civic_issues`
- `frontend/pages/dashboard.js` - Dashboard, fetches from `civic_issues`
- `frontend/pages/map-view.js` - Map, fetches from `civic_issues`
- `frontend/pages/tickets.js` - Tickets, fetches from `civic_issues`
- `frontend/components/ReportIssueForm.js` - Form, inserts to `civic_issues`

### Backend Files  
- `backend/app/models/incident.py` - Uses `incidents` table
- `backend/app/services/incident_service.py` - Creates Incident objects
- `backend/app/api/endpoints/incidents.py` - API endpoint

### Schema Files
- `supabase/schema.sql` - Defines both tables (problem!)

## Why This Happened

The project has **mixed database designs**:
1. Backend was built to use `incidents` table (SQLAlchemy ORM)
2. Frontend was built to use `civic_issues` table (direct Supabase)
3. Both got created in Supabase
4. Data flow broke because they're disconnected

## Future: Unify Database

After fixing, consider:
1. **Option A:** Use only `civic_issues` (frontend table)
   - Update backend to query `civic_issues` 
   - Remove `incidents` table definition
   
2. **Option B:** Use only `incidents` (backend table)
   - Update all frontend queries to `incidents`
   - Remove `civic_issues` from schema

**Current:** Hybrid approach is causing confusion

---

## Quick Action List

- [ ] Decide: Delete old `incidents` or keep as archive?
- [ ] Run SQL command in Supabase
- [ ] Clear cache: `rm -rf .next node_modules/.cache`
- [ ] Restart frontend: `npm run dev`
- [ ] Hard refresh browser
- [ ] Check console for fresh data
- [ ] Test creating new issue
- [ ] Verify issue appears in Supabase

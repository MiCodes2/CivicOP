# Quick Start - Admin User Creation

## 📋 User Credentials
```
Full Name:    Civic Admin
Email:        citizens.east.blr@gmail.com
Password:     Civic@2026
Username:     civic_admin (reference only)
Role:         admin
```

## ⚡ Quick Setup (3 steps, ~5 minutes)

### 1️⃣ Create Auth User
- Supabase Dashboard → Authentication → Users → **+ Add user**
- Email: `citizens.east.blr@gmail.com`
- Password: `Civic@2026`
- **Save the User ID** (UUID)

### 2️⃣ Create Database Record
- Supabase → SQL Editor → New query
- Paste this, replace `YOUR_UUID` with User ID from step 1:
```sql
INSERT INTO users (id, email, full_name, role, is_active, created_at, updated_at) 
VALUES ('YOUR_UUID', 'citizens.east.blr@gmail.com', 'Civic Admin', 'admin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```
- Click **Run**

### 3️⃣ Test Login
- App → Login page
- Email: `citizens.east.blr@gmail.com`
- Password: `Civic@2026`
- Should see governance dashboard

## ✅ Verify Setup
```sql
SELECT email, full_name, role, is_active FROM users 
WHERE email = 'citizens.east.blr@gmail.com';
```
Should return: **admin role, is_active = true**

## 🧪 Test Drag-and-Drop
1. Log in as admin user
2. Go to `/governance` → Workflow Triage tab
3. Drag a card to different column
4. Should see "✓ Moved to [STATUS]"
5. Refresh page - card stays in place ✓

## 📚 Full Documentation
- See: `ADMIN_USER_SETUP.md` (detailed steps)
- See: `TRIAGE_DRAG_DROP_FIX.md` (technical details)

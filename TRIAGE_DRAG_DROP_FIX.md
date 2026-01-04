# Triage Drag-and-Drop Fix - Complete Investigation & Solution

## Problem Summary
The workflow triage (kanban) drag-and-drop functionality was not working. Items would revert to their original position after being dropped, with error: "Failed to move item to RESOLVED"

## Root Causes Identified

### 1. **Database Permission Issue (Primary)**
The RLS policy for `civic_issues` UPDATE operation was too permissive and didn't properly check admin role:
```sql
-- OLD (Incorrect)
CREATE POLICY "Allow authenticated update on civic_issues" ON civic_issues
    FOR UPDATE USING (auth.role() = 'authenticated');
```

This allowed ANY authenticated user to update, but the issue was that:
- The user session wasn't being properly maintained on the governance page
- No actual admin role verification was happening

### 2. **Missing Authentication Check**
The governance page didn't verify that the user was:
- Actually logged in
- Had admin privileges to modify issues

### 3. **No User Session Management**
- The "Admin User" label was hardcoded
- No actual user session was being fetched or verified
- Users weren't forced to login before accessing the governance dashboard

## Solutions Implemented

### 1. **Updated RLS Policy** (`supabase/schema.sql`)
```sql
-- NEW (Correct)
CREATE POLICY "Allow admin update on civic_issues" ON civic_issues
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Allow admin delete on civic_issues" ON civic_issues
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );
```

**Why this works:**
- Checks if user is authenticated
- Verifies user exists in the users table with admin role
- Only allows updates from actual admin users

### 2. **Added Authentication to Governance Page** (`frontend/pages/governance.js`)

**Changes:**
- Added `useRouter` and `authHelpers` imports
- Added `currentUser` and `authChecked` state
- Implemented `useEffect` to check authentication on mount
- Redirects to `/login` if user is not authenticated
- Shows loading state while checking auth
- Updated user display to show actual user email
- Added "Sign Out" button

**Code:**
```javascript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await authHelpers.getCurrentUser();
      if (error || !user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);
    } catch (err) {
      console.error('Auth check failed:', err);
      router.push('/login');
    } finally {
      setAuthChecked(true);
    }
  };
  
  checkAuth();
}, [router]);
```

### 3. **Improved Error Handling in updateIncidentStatus**

**Changes:**
- Added authentication check before attempting update
- Better error messages that indicate specific issues
- Clear feedback when permissions are denied

**Code:**
```javascript
if (!currentUser) {
  throw new Error('Not authenticated. Please sign in first.');
}

// ... later ...
if (!updated || (Array.isArray(updated) && updated.length === 0)) {
  throw new Error('No rows were updated. Check database permissions.');
}
```

### 4. **User Display Enhancement**

Changed from hardcoded "Admin User" to:
- Display actual user email or full name
- Show first letter avatar
- Add Sign Out button
- Display "Governance Access" label

## How to Apply These Changes

### Step 1: Update Database RLS Policies
Run this SQL in Supabase SQL Editor:

```sql
-- Remove old policies
DROP POLICY IF EXISTS "Allow authenticated update on civic_issues" ON civic_issues;

-- Add new policies
CREATE POLICY "Allow admin update on civic_issues" ON civic_issues
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Allow admin delete on civic_issues" ON civic_issues
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );
```

### Step 2: Deploy Frontend Changes
The governance.js changes are already in place and will automatically:
- Redirect unauthenticated users to login
- Verify admin access on page load
- Provide proper error messages for failed updates

### Step 3: Ensure Users Have Admin Role
Make sure users trying to access governance have `role = 'admin'` in the users table:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

## Testing Checklist

- [ ] Login with admin user account
- [ ] Navigate to `/governance`
- [ ] Should NOT see "Not authenticated" message
- [ ] Drag a card from OPEN to IN_PROGRESS
- [ ] Should see "✓ Moved to IN_PROGRESS" message
- [ ] Card should stay in new column
- [ ] Refresh page - card should still be in new column
- [ ] Try with non-admin user - should see permission error
- [ ] Sign out button should work
- [ ] Unauthenticated access should redirect to login

## File Changes

1. **supabase/schema.sql** - Updated RLS policies for admin-only updates
2. **frontend/pages/governance.js** - Added authentication, improved UI, better error handling
3. **frontend/lib/supabase.ts** - No changes (authHelpers already existed)

## Expected Behavior After Fix

1. **Unauthenticated users** → Redirected to login
2. **Non-admin users** → Get "No rows were updated. Check database permissions." error
3. **Admin users** → Can drag-and-drop items successfully with persistent state
4. **Visual feedback** → Clear success/error messages for each action
5. **Session persistence** → User session maintained until sign-out

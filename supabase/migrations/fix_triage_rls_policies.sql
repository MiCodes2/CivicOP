-- ============================================================================
-- Triage Drag-and-Drop Fix - RLS Policy Updates
-- Run this in Supabase SQL Editor to enable admin-only workflow triage
-- ============================================================================
-- This migration fixes the drag-and-drop functionality for the governance 
-- kanban board by implementing proper admin role checks in RLS policies
-- ============================================================================

-- Step 1: Drop the old overly-permissive policy
DROP POLICY IF EXISTS "Allow authenticated update on civic_issues" ON civic_issues;

-- Step 2: Create new admin-only UPDATE policy
CREATE POLICY "Allow admin update on civic_issues" ON civic_issues
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Step 3: Create admin-only DELETE policy (optional but recommended)
CREATE POLICY "Allow admin delete on civic_issues" ON civic_issues
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Step 4: Verify policies are in place (query to check)
-- SELECT policyside, policy_name, qual FROM pg_policies WHERE tablename = 'civic_issues';

-- Step 5: Make sure your admin users have the correct role
-- Uncomment and customize the following as needed:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin@example.com';

-- ============================================================================
-- DONE! The governance dashboard drag-and-drop should now work correctly
-- ============================================================================
-- If you still see permission errors:
-- 1. Verify the user is logged in (authHelpers.getCurrentUser() returns a user)
-- 2. Check that user record has role = 'admin' in the users table
-- 3. Check browser console for detailed error messages
-- ============================================================================

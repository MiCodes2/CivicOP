-- ============================================================================
-- Helper: Get User UUID from Supabase Auth
-- ============================================================================
-- Run this query to find the User ID for your admin user

-- First, check if user already exists in auth_users table
SELECT 
    id AS user_id,
    email,
    CASE 
        WHEN created_at IS NOT NULL THEN 'EXISTS'
        ELSE 'NOT FOUND'
    END AS status,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'citizens.east.blr@gmail.com';

-- If the above query returns NO ROWS, you need to:
-- 1. Go to Supabase Dashboard
-- 2. Select your GuardTech project
-- 3. Go to: Authentication → Users → Add User
-- 4. Email: citizens.east.blr@gmail.com
-- 5. Password: Civic@2026
-- 6. Click "Create user"
-- 7. The User ID will be displayed in the user details

-- After user is created in Auth, copy the User ID and use it in create_admin_user.sql

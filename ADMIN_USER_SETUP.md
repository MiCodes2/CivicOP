-- ============================================================================
-- Create Admin User: Civic Admin
-- ============================================================================
-- This migration creates the admin user record in the users table
-- The auth user must be created separately via Supabase dashboard or CLI
-- ============================================================================

-- Step 1: Insert admin user record
-- NOTE: Replace the UUID below with the actual user ID from Supabase Auth
-- To get the user ID:
-- 1. Create the user in Supabase dashboard (Auth > Users > Add user)
--    Email: citizens.east.blr@gmail.com
--    Password: Civic@2026
-- 2. Copy the User ID from the details
-- 3. Replace 'ACTUAL_USER_UUID_HERE' below with that ID

INSERT INTO users (
    id, 
    email, 
    full_name, 
    phone,
    role, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    '55818019-3a7e-4fdf-aacc-f3d556ac7fb1',  -- Replace with actual UUID from auth
    'citizens.east.blr@gmail.com',
    'Civic Admin',
    NULL,
    'admin',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
    full_name = 'Civic Admin',
    role = 'admin',
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;

-- Verify the user was created
SELECT id, email, full_name, role, is_active, created_at FROM users 
WHERE email = 'citizens.east.blr@gmail.com';

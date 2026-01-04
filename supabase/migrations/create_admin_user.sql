-- ============================================================================
-- Create Admin User: Civic Admin
-- ============================================================================
-- This migration creates the admin user record in the users table
-- ============================================================================

-- IMPORTANT: Before running this, you MUST:
-- 1. Create the auth user in Supabase Dashboard
-- 2. Copy the User ID (UUID) from Supabase Auth
-- 3. Replace the UUID below

-- Step 0: Get the User ID from Supabase Auth
-- Go to: Supabase Dashboard → Authentication → Users
-- Find user with email: citizens.east.blr@gmail.com
-- Copy the "User ID" column value (format: 550e8400-e29b-41d4-a716-446655440000)

-- Step 1: Run this query AFTER replacing REPLACE_ME_WITH_ACTUAL_UUID below
-- Replace REPLACE_ME_WITH_ACTUAL_UUID with your copied UUID

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
    '55818019-3a7e-4fdf-aacc-f3d556ac7fb1'::uuid,
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

-- Step 2: Verify the user was created
SELECT id, email, full_name, role, is_active, created_at FROM users 
WHERE email = 'citizens.east.blr@gmail.com';

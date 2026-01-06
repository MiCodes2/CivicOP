-- ============================================================================
-- Create Sample Ward Admin and Executive Engineer Users
-- This script creates test users for the governance system
-- ============================================================================

-- NOTE: These users will need to be created in Supabase Auth first
-- This script just updates their profiles in the users table

-- ============================================================================
-- 1. CREATE WARD ADMIN USERS
-- ============================================================================

-- Ward Admin for Koramangala area (Wards 85-87)
INSERT INTO users (id, email, username, full_name, role, designation, assigned_wards, is_active)
VALUES (
    uuid_generate_v4(),
    'ward.admin.koramangala@civicop.gov.in',
    'koramangala_admin',
    'Rajesh Kumar',
    'ward_admin',
    'Ward Administrator - Koramangala Zone',
    ARRAY[85, 86, 87],
    true
) ON CONFLICT (email) DO UPDATE
SET role = 'ward_admin',
    designation = 'Ward Administrator - Koramangala Zone',
    assigned_wards = ARRAY[85, 86, 87],
    is_active = true;

-- Ward Admin for Whitefield area (Wards 184-186)
INSERT INTO users (id, email, username, full_name, role, designation, assigned_wards, is_active)
VALUES (
    uuid_generate_v4(),
    'ward.admin.whitefield@civicop.gov.in',
    'whitefield_admin',
    'Priya Sharma',
    'ward_admin',
    'Ward Administrator - Whitefield Zone',
    ARRAY[184, 185, 186],
    true
) ON CONFLICT (email) DO UPDATE
SET role = 'ward_admin',
    designation = 'Ward Administrator - Whitefield Zone',
    assigned_wards = ARRAY[184, 185, 186],
    is_active = true;

-- Ward Admin for Jayanagar area (Ward 87)
INSERT INTO users (id, email, username, full_name, role, designation, assigned_wards, is_active)
VALUES (
    uuid_generate_v4(),
    'ward.admin.jayanagar@civicop.gov.in',
    'jayanagar_admin',
    'Suresh Reddy',
    'ward_admin',
    'Ward Administrator - Jayanagar',
    ARRAY[87],
    true
) ON CONFLICT (email) DO UPDATE
SET role = 'ward_admin',
    designation = 'Ward Administrator - Jayanagar',
    assigned_wards = ARRAY[87],
    is_active = true;

-- Ward Admin for HSR Layout (Ward 130)
INSERT INTO users (id, email, username, full_name, role, designation, assigned_wards, is_active)
VALUES (
    uuid_generate_v4(),
    'ward.admin.hsr@civicop.gov.in',
    'hsr_admin',
    'Kavita Desai',
    'ward_admin',
    'Ward Administrator - HSR Layout',
    ARRAY[130],
    true
) ON CONFLICT (email) DO UPDATE
SET role = 'ward_admin',
    designation = 'Ward Administrator - HSR Layout',
    assigned_wards = ARRAY[130],
    is_active = true;

-- Ward Admin for Indiranagar (Ward 25)
INSERT INTO users (id, email, username, full_name, role, designation, assigned_wards, is_active)
VALUES (
    uuid_generate_v4(),
    'ward.admin.indiranagar@civicop.gov.in',
    'indiranagar_admin',
    'Arun Menon',
    'ward_admin',
    'Ward Administrator - Indiranagar',
    ARRAY[25],
    true
) ON CONFLICT (email) DO UPDATE
SET role = 'ward_admin',
    designation = 'Ward Administrator - Indiranagar',
    assigned_wards = ARRAY[25],
    is_active = true;

-- ============================================================================
-- 2. CREATE EXECUTIVE ENGINEER USERS
-- ============================================================================

-- Executive Engineer for Koramangala
INSERT INTO users (id, email, username, full_name, role, designation, assigned_wards, is_active)
VALUES (
    uuid_generate_v4(),
    'ee.koramangala@civicop.gov.in',
    'ee_koramangala',
    'Venkatesh Rao',
    'ward_executive_engineer',
    'Executive Engineer - Koramangala',
    ARRAY[85, 86, 87],
    true
) ON CONFLICT (email) DO UPDATE
SET role = 'ward_executive_engineer',
    designation = 'Executive Engineer - Koramangala',
    assigned_wards = ARRAY[85, 86, 87],
    is_active = true;

-- Executive Engineer for Whitefield
INSERT INTO users (id, email, username, full_name, role, designation, assigned_wards, is_active)
VALUES (
    uuid_generate_v4(),
    'ee.whitefield@civicop.gov.in',
    'ee_whitefield',
    'Lakshmi Narayanan',
    'ward_executive_engineer',
    'Executive Engineer - Whitefield',
    ARRAY[184, 185, 186],
    true
) ON CONFLICT (email) DO UPDATE
SET role = 'ward_executive_engineer',
    designation = 'Executive Engineer - Whitefield',
    assigned_wards = ARRAY[184, 185, 186],
    is_active = true;

-- Executive Engineer for HSR Layout
INSERT INTO users (id, email, username, full_name, role, designation, assigned_wards, is_active)
VALUES (
    uuid_generate_v4(),
    'ee.hsr@civicop.gov.in',
    'ee_hsr',
    'Anand Kumar',
    'ward_executive_engineer',
    'Executive Engineer - HSR Layout',
    ARRAY[130],
    true
) ON CONFLICT (email) DO UPDATE
SET role = 'ward_executive_engineer',
    designation = 'Executive Engineer - HSR Layout',
    assigned_wards = ARRAY[130],
    is_active = true;

-- ============================================================================
-- 3. VERIFY CREATED USERS
-- ============================================================================

-- Query to see all ward admins and engineers
SELECT 
    email,
    username,
    full_name,
    role,
    designation,
    assigned_wards,
    is_active,
    created_at
FROM users
WHERE role IN ('ward_admin', 'ward_executive_engineer')
ORDER BY role, full_name;

-- ============================================================================
-- 4. INSTRUCTIONS FOR SUPABASE AUTH SETUP
-- ============================================================================

/*
IMPORTANT: After running this script, you must create these users in Supabase Auth:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" for each email above
3. Set temporary passwords (users can reset via email)
4. The user IDs from Auth will automatically link to the users table

Example credentials for testing:
- ward.admin.koramangala@civicop.gov.in / password: Admin@123
- ward.admin.whitefield@civicop.gov.in / password: Admin@123
- ee.koramangala@civicop.gov.in / password: Engineer@123

SECURITY NOTE: Change these passwords immediately in production!
*/

-- ============================================================================
-- End of script
-- ============================================================================

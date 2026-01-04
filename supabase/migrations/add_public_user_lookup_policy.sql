-- Add public RLS policy for username/email lookups during login
-- This allows unauthenticated users to lookup user records by username or email
-- (necessary for the login process to work with username-based authentication)

CREATE POLICY "Public can lookup users by email or username" ON users
    FOR SELECT USING (true);

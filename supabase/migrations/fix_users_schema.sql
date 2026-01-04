-- Fix users table schema: make hashed_password nullable
-- Since passwords are managed by Supabase Auth (auth.users table),
-- the users table should not require storing hashed_password

ALTER TABLE users 
ALTER COLUMN hashed_password DROP NOT NULL;

ALTER TABLE users
ALTER COLUMN hashed_password SET DEFAULT NULL;

-- Add comment explaining the schema design
COMMENT ON COLUMN users.hashed_password IS 'Deprecated: passwords managed by Supabase Auth. Kept for backward compatibility only.';

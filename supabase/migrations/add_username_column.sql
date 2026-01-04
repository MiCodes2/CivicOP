-- Add username column to users table for flexible login support
-- Allows users to login with either email or username (e.g., 'civic_admin')

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;

-- Create index for efficient username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add comment explaining the column
COMMENT ON COLUMN users.username IS 'Optional short username for login. Alternative to email. Example: civic_admin';

-- Add username to Civic Admin user
-- Username: civic_admin (short alias for email: citizens.east.blr@gmail.com)

UPDATE users 
SET username = 'civic_admin'
WHERE email = 'citizens.east.blr@gmail.com';

-- Verify the update
SELECT id, email, username, full_name, role FROM users 
WHERE email = 'citizens.east.blr@gmail.com';

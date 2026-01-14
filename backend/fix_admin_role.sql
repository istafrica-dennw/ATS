-- Script to check and fix admin role for users

-- First, let's see all users and their roles
SELECT id, email, first_name, last_name, role, is_active
FROM users
ORDER BY id;

-- Update the default admin user to have ADMIN role
-- (Using the default admin email from application.properties)
UPDATE users
SET role = 'ADMIN'
WHERE email = 'admin@ats.istafrica';

-- If you want to make another user an admin, uncomment and update the email:
-- UPDATE users
-- SET role = 'ADMIN'
-- WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, first_name, last_name, role, is_active
FROM users
WHERE role = 'ADMIN';

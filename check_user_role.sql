-- Check the role of the admin user
SELECT id, email, first_name, last_name, role, is_active, is_email_verified
FROM users
WHERE email = 'admin@ats.istafrica';

-- If the admin user doesn't exist or doesn't have ADMIN role, this will fix it
UPDATE users
SET role = 'ADMIN', is_active = true, is_email_verified = true
WHERE email = 'admin@ats.istafrica';

-- Check all users and their roles
SELECT id, email, role FROM users ORDER BY id;

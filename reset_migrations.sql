-- First check if the organizations table exists and drop related tables if it does
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        -- Drop tables that might have foreign key dependencies on organizations
        DROP TABLE IF EXISTS email_notifications CASCADE;
        
        -- Drop the organizations table itself
        DROP TABLE IF EXISTS organizations CASCADE;
        
        -- Alter users table to remove organization-related columns
        ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS organization_id;
        ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS is_organization_admin;
        ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS is_system_admin;
        
        -- Restore unique constraint on email
        ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS unique_email_per_organization;
        ALTER TABLE IF EXISTS users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END
$$;

-- Remove migrations V8, V9, and V10 from the flyway schema history
DELETE FROM flyway_schema_history WHERE version IN ('8', '9', '10');

-- Update users table to remove SYSTEM_ADMIN role if it exists
UPDATE users SET role = 'ADMIN' WHERE role = 'SYSTEM_ADMIN';

-- Confirm the changes
SELECT * FROM flyway_schema_history ORDER BY installed_rank; 
-- Add region field to users table for GDPR compliance
-- This allows data isolation between EU and non-EU regions

ALTER TABLE users 
ADD COLUMN region VARCHAR(10) DEFAULT NULL;

-- Create index for better performance when filtering by region
CREATE INDEX idx_users_region ON users(region);

-- Add comment to document the field purpose and valid values
COMMENT ON COLUMN users.region IS 'User region for GDPR compliance. Valid values: EU (Europe), RW (Rwanda), OTHER (other regions), NULL (default)';
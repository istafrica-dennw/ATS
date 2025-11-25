-- Add Connect Consent Token fields for admin-created user invitation flow
-- These fields are used to send invitation emails with Connect consent links

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS connect_consent_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS connect_consent_token_expiry TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_connect_consent_token ON users(connect_consent_token) WHERE connect_consent_token IS NOT NULL;


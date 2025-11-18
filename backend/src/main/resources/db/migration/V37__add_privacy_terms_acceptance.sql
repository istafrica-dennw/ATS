-- Add privacy policy acceptance fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance when querying users by privacy policy acceptance status
CREATE INDEX IF NOT EXISTS idx_users_privacy_policy_accepted ON users(privacy_policy_accepted) WHERE privacy_policy_accepted = true;


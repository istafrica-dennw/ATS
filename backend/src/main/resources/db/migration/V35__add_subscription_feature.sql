-- Add subscription fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_preferences TEXT DEFAULT '{"jobNotifications": true, "bulkEmails": true}';

-- Create index for better performance when querying subscribed users
CREATE INDEX IF NOT EXISTS idx_users_is_subscribed ON users(is_subscribed) WHERE is_subscribed = true;

-- Create a subscription_logs table to track subscription history
CREATE TABLE IF NOT EXISTS subscription_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'SUBSCRIBED', 'UNSUBSCRIBED'
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_logs_user_id ON subscription_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_created_at ON subscription_logs(created_at);


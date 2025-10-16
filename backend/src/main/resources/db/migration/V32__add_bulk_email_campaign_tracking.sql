-- Add bulk email campaign tracking to email notifications
ALTER TABLE email_notifications 
ADD COLUMN IF NOT EXISTS bulk_email_campaign_id VARCHAR(255);

-- Create index for better performance when querying by campaign (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_email_notifications_bulk_campaign_id ON email_notifications(bulk_email_campaign_id);
-- Update the foreign key constraint for email_notifications to allow NULL and ON DELETE SET NULL
-- This allows users to be deleted without violating foreign key constraints

ALTER TABLE email_notifications
DROP CONSTRAINT IF EXISTS email_notifications_related_user_id_fkey;

ALTER TABLE email_notifications
ADD CONSTRAINT email_notifications_related_user_id_fkey
FOREIGN KEY (related_user_id)
REFERENCES users(id)
ON DELETE SET NULL;

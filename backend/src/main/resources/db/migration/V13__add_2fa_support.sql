-- Add 2FA-related columns to the users table
ALTER TABLE users 
ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN mfa_secret VARCHAR(255),
ADD COLUMN mfa_recovery_codes TEXT[]; 
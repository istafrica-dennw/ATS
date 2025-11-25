-- Privacy Permissions System Migration
-- This migration adds support for granular privacy permissions for job applications and Connect feature

-- Add privacy permission fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS application_consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS application_consent_given_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS future_jobs_consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS future_jobs_consent_given_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS connect_consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS connect_consent_given_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_deletion_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_deletion_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_deletion_scheduled_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_application_consent ON users(application_consent_given) WHERE application_consent_given = true;
CREATE INDEX IF NOT EXISTS idx_users_future_jobs_consent ON users(future_jobs_consent_given) WHERE future_jobs_consent_given = true;
CREATE INDEX IF NOT EXISTS idx_users_connect_consent ON users(connect_consent_given) WHERE connect_consent_given = true;
CREATE INDEX IF NOT EXISTS idx_users_data_deletion ON users(data_deletion_requested) WHERE data_deletion_requested = true;

-- Create privacy_settings table for admin-configurable privacy terms
CREATE TABLE IF NOT EXISTS privacy_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default privacy settings
INSERT INTO privacy_settings (setting_key, setting_value, description, is_active) VALUES
('application_consent_checkbox_enabled', 'true', 'Enable mandatory checkbox for job application consent', true),
('application_consent_terms', 'I have read the {privacy-policy} and confirm that IST store my personal details to be able to process my application.', 'Terms for job application consent checkbox', true),
('application_future_jobs_checkbox_enabled', 'true', 'Enable optional checkbox for future jobs permission in applications', true),
('application_future_jobs_terms', 'Yes, {company-name} can contact me directly about specific future job opportunities.', 'Terms for future jobs consent checkbox in applications', true),
('connect_consent_checkbox_enabled', 'true', 'Enable mandatory checkbox for Connect feature consent', true),
('connect_consent_terms', 'I have read the {privacy-policy} and confirm that IST store my personal details to be able to contact me for future job opportunities. IST will hold your data for future employment opportunities for a maximum period of 2 years, or until you decide to withdraw your consent, which you can do at any given time by contacting us.', 'Terms for Connect feature consent checkbox', true),
('connect_future_jobs_checkbox_enabled', 'true', 'Enable optional checkbox for future jobs permission in Connect', true),
('connect_future_jobs_terms', 'Yes, {company-name} can contact me directly about specific future job opportunities.', 'Terms for future jobs consent checkbox in Connect', true),
('company_name', 'IST', 'Company name used in privacy terms', true),
('privacy_policy_url', '/privacy-policy', 'URL to privacy policy page', true),
('data_retention_period_years', '2', 'Data retention period in years for Connect feature', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Create privacy_consent_logs table to track consent history
CREATE TABLE IF NOT EXISTS privacy_consent_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- 'APPLICATION', 'FUTURE_JOBS', 'CONNECT'
    action VARCHAR(50) NOT NULL, -- 'GIVEN', 'WITHDRAWN', 'UPDATED'
    terms_version TEXT, -- Store the terms text that was shown to user
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_privacy_consent_logs_user_id ON privacy_consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consent_logs_consent_type ON privacy_consent_logs(consent_type);
CREATE INDEX IF NOT EXISTS idx_privacy_consent_logs_created_at ON privacy_consent_logs(created_at);

-- Create candidate_data_requests table for GDPR data requests
CREATE TABLE IF NOT EXISTS candidate_data_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- 'EXPORT', 'DELETE', 'UPDATE'
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by BIGINT REFERENCES users(id),
    response_data TEXT, -- JSON data or file path
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_candidate_data_requests_user_id ON candidate_data_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_data_requests_status ON candidate_data_requests(status);
CREATE INDEX IF NOT EXISTS idx_candidate_data_requests_request_type ON candidate_data_requests(request_type);


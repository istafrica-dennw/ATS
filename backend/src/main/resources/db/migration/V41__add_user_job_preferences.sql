-- V41: Add user job preferences table for career portal connect feature
-- Stores user email, selected job categories, and consent status

-- Create user_job_preferences table
CREATE TABLE IF NOT EXISTS user_job_preferences (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    consent_accepted BOOLEAN NOT NULL DEFAULT false,
    consent_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for user preferences and job categories (many-to-many)
CREATE TABLE IF NOT EXISTS user_job_preference_categories (
    user_job_preference_id BIGINT NOT NULL,
    job_category_id BIGINT NOT NULL,
    PRIMARY KEY (user_job_preference_id, job_category_id),
    CONSTRAINT fk_user_job_preference
        FOREIGN KEY (user_job_preference_id)
        REFERENCES user_job_preferences(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_job_category
        FOREIGN KEY (job_category_id)
        REFERENCES job_categories(id)
        ON DELETE CASCADE
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_user_job_preferences_email ON user_job_preferences(email);

-- Create index for the junction table
CREATE INDEX IF NOT EXISTS idx_user_job_pref_categories_preference_id ON user_job_preference_categories(user_job_preference_id);
CREATE INDEX IF NOT EXISTS idx_user_job_pref_categories_category_id ON user_job_preference_categories(job_category_id);


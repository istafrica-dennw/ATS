-- V40: Add job categories table and relationship to jobs

-- Create job_categories table
CREATE TABLE IF NOT EXISTS job_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1', -- Hex color code for UI display
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category_id BIGINT;

-- Add foreign key constraint
ALTER TABLE jobs 
    ADD CONSTRAINT fk_jobs_category 
    FOREIGN KEY (category_id) 
    REFERENCES job_categories(id) 
    ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);

-- Insert some default categories
INSERT INTO job_categories (name, description, color) VALUES 
    ('Engineering', 'Software development, DevOps, and technical roles', '#3b82f6'),
    ('Design', 'UI/UX, graphic design, and creative roles', '#ec4899'),
    ('Marketing', 'Marketing, communications, and brand management', '#f59e0b'),
    ('Sales', 'Sales, business development, and account management', '#10b981'),
    ('Operations', 'Operations, logistics, and project management', '#8b5cf6'),
    ('Human Resources', 'HR, recruitment, and people operations', '#06b6d4'),
    ('Finance', 'Finance, accounting, and financial planning', '#84cc16'),
    ('Customer Support', 'Customer service and support roles', '#f97316')
ON CONFLICT (name) DO NOTHING;



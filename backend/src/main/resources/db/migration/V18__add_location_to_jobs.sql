-- Add location column to jobs table
ALTER TABLE jobs ADD COLUMN location VARCHAR(255);

-- Create index for location field
CREATE INDEX idx_jobs_location ON jobs(location);

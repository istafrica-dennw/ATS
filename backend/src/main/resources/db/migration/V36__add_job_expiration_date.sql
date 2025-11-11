-- Add expiration_date column to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- Add index for better performance when querying expired jobs
CREATE INDEX IF NOT EXISTS idx_jobs_expiration_date ON jobs(expiration_date) WHERE expiration_date IS NOT NULL;


-- Add region field to jobs table for GDPR compliance
-- This allows job data isolation between EU and non-EU regions

ALTER TABLE jobs 
ADD COLUMN region VARCHAR(10) DEFAULT NULL;

-- Create index for better performance when filtering by region
CREATE INDEX idx_jobs_region ON jobs(region);

-- Add comment to document the field purpose and valid values
COMMENT ON COLUMN jobs.region IS 'Job region for GDPR compliance. Valid values: EU (Europe), RW (Rwanda), OTHER (other regions), NULL (default)';
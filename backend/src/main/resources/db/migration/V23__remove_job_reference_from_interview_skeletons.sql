-- Remove job reference from interview skeletons to make them independent
-- This allows any skeleton to be used with any interview regardless of job

-- Drop the foreign key constraint first
ALTER TABLE interview_skeletons DROP CONSTRAINT IF EXISTS fk_skeleton_job;

-- Drop the index on job_id
DROP INDEX IF EXISTS idx_interview_skeletons_job_id;

-- Remove the job_id column
ALTER TABLE interview_skeletons DROP COLUMN IF EXISTS job_id;

-- Add a comment to document the change
COMMENT ON TABLE interview_skeletons IS 'Interview skeletons are now independent of jobs and can be reused across different positions'; 
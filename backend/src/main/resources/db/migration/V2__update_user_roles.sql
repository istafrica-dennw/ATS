-- Update existing roles to match the new enum
UPDATE users 
SET role = 'CANDIDATE' 
WHERE role = 'RECRUITER' OR role = 'INTERVIEWER' OR role = 'HIRING_MANAGER';

-- Add a check constraint to ensure only valid roles are used
ALTER TABLE users 
ADD CONSTRAINT valid_role 
CHECK (role IN ('CANDIDATE', 'ADMIN', 'INTERVIEWER', 'HIRING_MANAGER')); 
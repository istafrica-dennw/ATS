-- Fix skeleton_job_associations table to add missing updated_at column if it doesn't exist
DO $$
BEGIN
    -- Check if updated_at column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'skeleton_job_associations' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE skeleton_job_associations 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        
        -- Update existing records to have current timestamp
        UPDATE skeleton_job_associations SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;
END$$;

-- Ensure the update trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_skeleton_job_associations_updated_at ON skeleton_job_associations;

CREATE TRIGGER update_skeleton_job_associations_updated_at 
    BEFORE UPDATE ON skeleton_job_associations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
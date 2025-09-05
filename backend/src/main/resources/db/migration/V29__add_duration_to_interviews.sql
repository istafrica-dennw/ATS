-- Add duration_minutes column to interviews table
ALTER TABLE interviews ADD COLUMN duration_minutes INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN interviews.duration_minutes IS 'Duration of the interview in minutes';
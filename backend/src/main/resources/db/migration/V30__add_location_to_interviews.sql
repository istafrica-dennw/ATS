-- Add location fields to interviews table
ALTER TABLE interviews ADD COLUMN location_type VARCHAR(20);
ALTER TABLE interviews ADD COLUMN location_address TEXT;

-- Add comments to explain the columns
COMMENT ON COLUMN interviews.location_type IS 'Type of interview location: OFFICE or ONLINE';
COMMENT ON COLUMN interviews.location_address IS 'Address for office interviews, null for online interviews';
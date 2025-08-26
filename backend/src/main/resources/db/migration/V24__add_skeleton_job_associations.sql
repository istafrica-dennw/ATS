-- Create skeleton-job association table for many-to-many relationship
CREATE TABLE skeleton_job_associations (
    id BIGSERIAL PRIMARY KEY,
    skeleton_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    
    CONSTRAINT fk_association_skeleton FOREIGN KEY (skeleton_id) REFERENCES interview_skeletons(id) ON DELETE CASCADE,
    CONSTRAINT fk_association_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_association_creator FOREIGN KEY (created_by) REFERENCES users(id),
    
    -- Unique constraint: one association per skeleton-job combination
    CONSTRAINT uk_skeleton_job_association UNIQUE (skeleton_id, job_id)
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_skeleton_job_associations_updated_at 
    BEFORE UPDATE ON skeleton_job_associations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_skeleton_job_associations_skeleton_id ON skeleton_job_associations(skeleton_id);
CREATE INDEX idx_skeleton_job_associations_job_id ON skeleton_job_associations(job_id);

-- Add comment to document the purpose
COMMENT ON TABLE skeleton_job_associations IS 'Many-to-many relationship between interview skeletons and jobs - allows flexible assignment of skeletons to multiple jobs';
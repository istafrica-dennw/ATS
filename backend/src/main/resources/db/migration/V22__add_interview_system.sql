-- Add shortlisted status to applications
ALTER TABLE applications ADD COLUMN is_shortlisted BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN shortlisted_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN shortlisted_by BIGINT REFERENCES users(id);

-- Create interview skeletons table
CREATE TABLE interview_skeletons (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    focus_areas JSONB NOT NULL, -- Array of {title: string, description?: string}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    
    CONSTRAINT fk_skeleton_job FOREIGN KEY (job_id) REFERENCES jobs(id),
    CONSTRAINT fk_skeleton_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

DROP TABLE IF EXISTS interviews CASCADE;
-- Create interviews table
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    interviewer_id BIGINT NOT NULL, -- References users table with INTERVIEWER role
    skeleton_id BIGINT NOT NULL,
    responses JSONB, -- Array of {title: string, feedback: string, rating: number}
    status VARCHAR(20) DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED')),
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT NOT NULL,
    
    CONSTRAINT fk_interview_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_interview_interviewer FOREIGN KEY (interviewer_id) REFERENCES users(id),
    CONSTRAINT fk_interview_skeleton FOREIGN KEY (skeleton_id) REFERENCES interview_skeletons(id),
    CONSTRAINT fk_interview_assignor FOREIGN KEY (assigned_by) REFERENCES users(id),
    
    -- Unique constraint: one interview per application-interviewer-skeleton combination
    CONSTRAINT uk_interview_unique UNIQUE (application_id, interviewer_id, skeleton_id)
);

-- Create indexes for performance
CREATE INDEX idx_interview_skeletons_job_id ON interview_skeletons(job_id);
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX idx_interviews_skeleton_id ON interviews(skeleton_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_applications_shortlisted ON applications(is_shortlisted); 
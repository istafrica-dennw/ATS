-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    linkedin_id VARCHAR(255) UNIQUE,
    linkedin_profile_url VARCHAR(255),
    profile_picture_url VARCHAR(255),
    authentication_method VARCHAR(50) DEFAULT 'LINKEDIN',
    is_email_password_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- LinkedIn authentication data
CREATE TABLE linkedin_auth_data (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    access_token VARCHAR(255),
    refresh_token VARCHAR(255),
    token_expires_at TIMESTAMP WITH TIME ZONE,
    profile_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Authentication settings
CREATE TABLE auth_settings (
    id BIGSERIAL PRIMARY KEY,
    email_password_enabled BOOLEAN DEFAULT false,
    linkedin_enabled BOOLEAN DEFAULT true,
    linkedin_client_id VARCHAR(255),
    linkedin_client_secret VARCHAR(255),
    linkedin_redirect_uri VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    notification_preferences JSONB,
    communication_preferences JSONB,
    timezone VARCHAR(50),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    job_type VARCHAR(50),
    experience_level VARCHAR(50),
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    salary_range JSONB,
    hiring_manager_id BIGINT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'DRAFT',
    application_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id)
);

-- Job custom fields
CREATE TABLE job_custom_fields (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id),
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT,
    field_type VARCHAR(50) NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id),
    candidate_id BIGINT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'APPLIED',
    resume_url VARCHAR(255),
    cover_letter_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    experience_years DECIMAL(4,1),
    current_company VARCHAR(255),
    current_position VARCHAR(255),
    expected_salary DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Application answers
CREATE TABLE application_answers (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT REFERENCES applications(id),
    question_id BIGINT,
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interviews table
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT REFERENCES applications(id),
    interview_type VARCHAR(50) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    meeting_link VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview participants
CREATE TABLE interview_participants (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES interviews(id),
    user_id BIGINT REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations table
CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES interviews(id),
    interviewer_id BIGINT REFERENCES users(id),
    technical_score INTEGER,
    presentation_score INTEGER,
    understanding_score INTEGER,
    total_score INTEGER,
    recommendation TEXT,
    strengths TEXT,
    improvements TEXT,
    examples TEXT,
    team_fit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Experience calculation
CREATE TABLE experience_calculations (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT REFERENCES applications(id),
    employment_history JSONB,
    full_time_years DECIMAL(4,1),
    part_time_years DECIMAL(4,1),
    total_years DECIMAL(4,1),
    calculation_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email templates
CREATE TABLE email_templates (
    id BIGSERIAL PRIMARY KEY,
    template_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Communications
CREATE TABLE communications (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT REFERENCES email_templates(id),
    sender_id BIGINT REFERENCES users(id),
    recipient_id BIGINT REFERENCES users(id),
    subject VARCHAR(255),
    body TEXT,
    status VARCHAR(50) DEFAULT 'SENT',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Test Messages table for Hello World endpoint
CREATE TABLE testmessages (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_linkedin_id ON users(linkedin_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_evaluations_interview_id ON evaluations(interview_id);
CREATE INDEX idx_communications_status ON communications(status); 
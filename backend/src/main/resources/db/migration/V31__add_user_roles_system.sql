-- V31: Add multiple roles system
-- This migration adds support for multiple roles per user while preserving existing data

-- Create user_roles junction table for many-to-many relationship
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT REFERENCES users(id),
    UNIQUE(user_id, role)
);

-- Create user role sessions table for tracking current active role
CREATE TABLE user_role_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "current_role" VARCHAR(20) NOT NULL,
    session_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Migrate existing roles to new system
-- This preserves all existing user roles as their primary role
INSERT INTO user_roles (user_id, role, is_primary, assigned_at)
SELECT 
    id as user_id,
    role,
    TRUE as is_primary,  -- Mark existing roles as primary
    created_at as assigned_at
FROM users 
WHERE role IS NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_is_primary ON user_roles(is_primary);
CREATE INDEX idx_user_role_sessions_user_id ON user_role_sessions(user_id);
CREATE INDEX idx_user_role_sessions_token ON user_role_sessions(session_token);
CREATE INDEX idx_user_role_sessions_expires_at ON user_role_sessions(expires_at);

-- Add comments to explain the new tables
COMMENT ON TABLE user_roles IS 'Junction table for user-role many-to-many relationship';
COMMENT ON COLUMN user_roles.user_id IS 'Reference to users table';
COMMENT ON COLUMN user_roles.role IS 'Role assigned to the user (CANDIDATE, ADMIN, INTERVIEWER, HIRING_MANAGER)';
COMMENT ON COLUMN user_roles.is_primary IS 'Whether this is the primary role for the user';
COMMENT ON COLUMN user_roles.assigned_at IS 'When the role was assigned';
COMMENT ON COLUMN user_roles.assigned_by IS 'User who assigned this role (for audit trail)';

COMMENT ON TABLE user_role_sessions IS 'Tracks current active role for each user session';
COMMENT ON COLUMN user_role_sessions.user_id IS 'Reference to users table';
COMMENT ON COLUMN user_role_sessions."current_role" IS 'Currently active role for this session';
COMMENT ON COLUMN user_role_sessions.session_token IS 'Unique session token for role switching';
COMMENT ON COLUMN user_role_sessions.expires_at IS 'When this role session expires';
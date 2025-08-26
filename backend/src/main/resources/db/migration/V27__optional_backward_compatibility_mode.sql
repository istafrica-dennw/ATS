-- Optional: Backward compatibility mode
-- This script can be used if you want to temporarily disable strict filtering
-- and allow all skeletons to be used with all jobs until associations are manually configured

-- Add a configuration table for feature flags
CREATE TABLE IF NOT EXISTS system_config (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add backward compatibility flag (can be toggled via admin panel later)
INSERT INTO system_config (config_key, config_value, description)
VALUES (
    'skeleton_job_strict_mode', 
    'false', 
    'When false, allows all skeletons to be used with all jobs. When true, enforces skeleton-job associations.'
) ON CONFLICT (config_key) DO NOTHING;

-- Log the setting
DO $$
BEGIN
    RAISE NOTICE 'Backward compatibility mode enabled. Skeleton-job strict filtering is disabled.';
    RAISE NOTICE 'To enable strict mode later, update system_config: SET config_value = ''true'' WHERE config_key = ''skeleton_job_strict_mode''';
END$$;
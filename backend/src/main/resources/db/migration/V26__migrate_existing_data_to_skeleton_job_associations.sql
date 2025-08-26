-- Migration script to handle existing production data
-- This script creates skeleton-job associations for existing interviews to maintain backward compatibility

DO $$
DECLARE
    admin_user_id BIGINT;
    skeleton_record RECORD;
    job_record RECORD;
    association_count INTEGER := 0;
BEGIN
    -- Find an admin user to assign as creator of associations
    -- Try to find a user with ADMIN role first, fallback to first user
    SELECT id INTO admin_user_id 
    FROM users 
    WHERE role = 'ADMIN' 
    LIMIT 1;
    
    -- If no admin found, use first available user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id 
        FROM users 
        ORDER BY created_at ASC 
        LIMIT 1;
    END IF;
    
    -- Only proceed if we have a user
    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Using user ID % as creator for skeleton-job associations', admin_user_id;
        
        -- Strategy 1: Associate skeletons with jobs based on existing interviews
        -- This creates associations for skeleton-job combinations that were actually used
        INSERT INTO skeleton_job_associations (skeleton_id, job_id, created_by, created_at, updated_at)
        SELECT DISTINCT 
            i.skeleton_id,
            a.job_id,
            admin_user_id,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        WHERE NOT EXISTS (
            -- Avoid duplicates
            SELECT 1 FROM skeleton_job_associations sja 
            WHERE sja.skeleton_id = i.skeleton_id 
            AND sja.job_id = a.job_id
        );
        
        GET DIAGNOSTICS association_count = ROW_COUNT;
        RAISE NOTICE 'Created % skeleton-job associations based on existing interviews', association_count;
        
        -- Strategy 2: If no interviews exist, associate all skeletons with all jobs
        -- This provides maximum backward compatibility for systems with no interview history
        IF association_count = 0 THEN
            INSERT INTO skeleton_job_associations (skeleton_id, job_id, created_by, created_at, updated_at)
            SELECT 
                s.id as skeleton_id,
                j.id as job_id,
                admin_user_id,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            FROM interview_skeletons s
            CROSS JOIN jobs j
            WHERE NOT EXISTS (
                -- Avoid duplicates
                SELECT 1 FROM skeleton_job_associations sja 
                WHERE sja.skeleton_id = s.id 
                AND sja.job_id = j.id
            );
            
            GET DIAGNOSTICS association_count = ROW_COUNT;
            RAISE NOTICE 'No existing interviews found. Created % skeleton-job associations (all skeletons with all jobs)', association_count;
        END IF;
        
    ELSE
        RAISE WARNING 'No users found in database. Skeleton-job associations cannot be created automatically.';
        RAISE WARNING 'You will need to manually create associations after deployment.';
    END IF;
    
    -- Log final state
    SELECT COUNT(*) INTO association_count FROM skeleton_job_associations;
    RAISE NOTICE 'Total skeleton-job associations in database: %', association_count;
    
END$$;
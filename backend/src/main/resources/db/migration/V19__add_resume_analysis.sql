-- Add resume analysis JSON field to applications table
ALTER TABLE applications 
ADD COLUMN resume_analysis JSONB;

-- Add index on resume analysis for better query performance
CREATE INDEX idx_applications_resume_analysis ON applications USING GIN (resume_analysis);

-- Add comments for documentation
COMMENT ON COLUMN applications.resume_analysis IS 'AI-extracted resume analysis data including experience, skills, companies, and scoring';

-- Example of the JSON structure that will be stored:
-- {
--   "total_experience_years": 5.5,
--   "total_companies_worked": 3,
--   "current_company": "Tech Corp",
--   "current_position": "Senior Software Engineer",
--   "previous_positions": [
--     {
--       "company": "StartupXYZ",
--       "position": "Software Engineer",
--       "duration_months": 18,
--       "start_date": "2020-01",
--       "end_date": "2021-06"
--     }
--   ],
--   "skills_extracted": ["Java", "Spring Boot", "React", "PostgreSQL"],
--   "education": [
--     {
--       "degree": "Bachelor of Computer Science",
--       "institution": "University ABC",
--       "graduation_year": 2019
--     }
--   ],
--   "resume_score": {
--     "overall_score": 85,
--     "job_match_score": 78,
--     "experience_score": 90,
--     "skills_match_score": 82,
--     "scoring_criteria": {
--       "required_skills_match": 0.85,
--       "experience_level_match": 0.90,
--       "industry_relevance": 0.75
--     }
--   },
--   "analysis_metadata": {
--     "processed_at": "2024-06-02T10:30:00Z",
--     "ai_model_used": "gpt-4",
--     "confidence_score": 0.92,
--     "processing_time_ms": 2500
--   }
-- } 
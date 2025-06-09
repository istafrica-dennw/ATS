-- Remove unique constraint on candidate_id to allow multiple conversations per candidate
ALTER TABLE conversations DROP CONSTRAINT conversations_candidate_id_key; 
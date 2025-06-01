package com.ats.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ats.model.JobCustomQuestion;

@Repository
public interface JobCustomQuestionRepository extends JpaRepository<JobCustomQuestion, Long> {
    
    /**
     * Find all custom questions for a specific job
     * 
     * @param jobId The ID of the job
     * @return List of custom questions for the job
     */
    List<JobCustomQuestion> findByJobId(Long jobId);
    
    /**
     * Check if a custom question exists for a specific job
     * 
     * @param jobId The ID of the job
     * @param customQuestionId The ID of the custom question
     * @return true if the question exists for the job, false otherwise
     */
    boolean existsByJobIdAndId(Long jobId, Long customQuestionId);
    
    /**
     * Find all custom questions for a specific job filtered by required status
     * 
     * @param jobId The ID of the job
     * @param isRequired Whether the question is required or not
     * @return List of custom questions for the job that match the required status
     */
    List<JobCustomQuestion> findByJobIdAndIsRequired(Long jobId, boolean isRequired);
}

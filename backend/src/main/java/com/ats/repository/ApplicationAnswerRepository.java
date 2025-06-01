package com.ats.repository;

import com.ats.model.ApplicationAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationAnswerRepository extends JpaRepository<ApplicationAnswer, Long> {

    /**
     * Find all answers for a specific application
     * 
     * @param applicationId the application ID
     * @return list of application answers
     */
    List<ApplicationAnswer> findByApplicationId(Long applicationId);
    
    /**
     * Find answers for a specific application and question
     * 
     * @param applicationId the application ID
     * @param questionId the question ID
     * @return list of application answers
     */
    List<ApplicationAnswer> findByApplicationIdAndQuestionId(Long applicationId, Long questionId);
    
    /**
     * Delete all answers for a specific application
     * 
     * @param applicationId the application ID
     */
    void deleteByApplicationId(Long applicationId);
    
    /**
     * Get all answers for a specific question across all applications
     * 
     * @param questionId the question ID
     * @return list of application answers
     */
    List<ApplicationAnswer> findByQuestionId(Long questionId);
    
    /**
     * Count the number of answers for a specific question
     * 
     * @param questionId the question ID
     * @return the count of answers
     */
    long countByQuestionId(Long questionId);
    
    /**
     * Find answer statistics for a specific question
     * This can be used to calculate distribution of answers for multiple choice questions
     * 
     * @param questionId the question ID
     * @return list of answer count by value
     */
    @Query("SELECT aa.answer as answer, COUNT(aa) as count FROM ApplicationAnswer aa WHERE aa.questionId = :questionId GROUP BY aa.answer")
    List<Object[]> getAnswerStatsByQuestionId(@Param("questionId") Long questionId);
}

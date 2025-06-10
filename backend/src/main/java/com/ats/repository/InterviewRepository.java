package com.ats.repository;

import com.ats.model.Interview;
import com.ats.model.InterviewStatus;
import com.ats.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    
    List<Interview> findByInterviewerId(Long interviewerId);
    
    List<Interview> findByInterviewerIdAndStatus(Long interviewerId, InterviewStatus status);
    
    List<Interview> findByApplicationId(Long applicationId);
    
    List<Interview> findBySkeletonId(Long skeletonId);
    
    Optional<Interview> findByApplicationIdAndInterviewerIdAndSkeletonId(
        Long applicationId, Long interviewerId, Long skeletonId);
    
    @Query("SELECT i FROM Interview i WHERE i.application.job.id = :jobId")
    List<Interview> findByJobId(@Param("jobId") Long jobId);
    
    @Query("SELECT i FROM Interview i WHERE i.assignedBy.id = :assignedById")
    List<Interview> findByAssignedById(@Param("assignedById") Long assignedById);
    
    @Query("SELECT COUNT(i) FROM Interview i WHERE i.interviewer.id = :interviewerId AND i.status = :status")
    Long countByInterviewerIdAndStatus(@Param("interviewerId") Long interviewerId, @Param("status") InterviewStatus status);
    
    // Find all available interviewers (users with INTERVIEWER role)
    @Query("SELECT DISTINCT i.interviewer FROM Interview i WHERE i.interviewer.role = :role")
    List<com.ats.model.User> findAllInterviewers(@Param("role") Role role);
    
    /**
     * Find interviews by candidate ID (through application relationship)
     */
    @Query("SELECT i FROM Interview i WHERE i.application.candidate.id = :candidateId")
    List<Interview> findByCandidateId(@Param("candidateId") Long candidateId);
} 
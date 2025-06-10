package com.ats.repository;

import com.ats.model.Application;
import com.ats.model.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    /**
     * Find all applications by job ID
     * 
     * @param jobId the job ID
     * @param pageable pagination information
     * @return a page of applications
     */
    Page<Application> findByJobId(Long jobId, Pageable pageable);
    
    /**
     * Find all applications by candidate ID
     * 
     * @param candidateId the candidate ID
     * @param pageable pagination information
     * @return a page of applications
     */
    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);
    
    /**
     * Find applications by job ID and status
     * 
     * @param jobId the job ID
     * @param status the application status
     * @param pageable pagination information
     * @return a page of applications
     */
    Page<Application> findByJobIdAndStatus(Long jobId, ApplicationStatus status, Pageable pageable);
    
    /**
     * Find applications by candidate ID and status
     * 
     * @param candidateId the candidate ID
     * @param status the application status
     * @param pageable pagination information
     * @return a page of applications
     */
    Page<Application> findByCandidateIdAndStatus(Long candidateId, ApplicationStatus status, Pageable pageable);
    
    /**
     * Find an application by job ID and candidate ID
     * 
     * @param jobId the job ID
     * @param candidateId the candidate ID
     * @return the application if found
     */
    Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);
    
    /**
     * Count the number of applications for a job
     * 
     * @param jobId the job ID
     * @return the count of applications
     */
    long countByJobId(Long jobId);
    
    /**
     * Count the number of applications by status for a job
     * 
     * @param jobId the job ID
     * @param status the application status
     * @return the count of applications
     */
    long countByJobIdAndStatus(Long jobId, ApplicationStatus status);
    
    /**
     * Get application statistics grouped by status for a specific job
     * 
     * @param jobId the job ID
     * @return list of count by status
     */
    @Query("SELECT a.status as status, COUNT(a) as count FROM Application a WHERE a.job.id = :jobId GROUP BY a.status")
    List<Object[]> getApplicationStatsByJobId(@Param("jobId") Long jobId);
    
    /**
     * Find applications by job ID and shortlisting status
     * 
     * @param jobId the job ID
     * @param isShortlisted the shortlisting status
     * @return list of applications
     */
    List<Application> findByJobIdAndIsShortlisted(Long jobId, Boolean isShortlisted);
    
    /**
     * Find all shortlisted applications across all jobs
     * 
     * @param isShortlisted the shortlisting status
     * @return list of shortlisted applications
     */
    List<Application> findByIsShortlisted(Boolean isShortlisted);
}

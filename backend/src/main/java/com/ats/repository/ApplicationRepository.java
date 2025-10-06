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
     * Find all applications by status
     * 
     * @param status the application status
     * @return list of applications
     */
    List<Application> findByStatus(ApplicationStatus status);

    /**
     * Find all applications (for bulk operations)
     * 
     * @return list of all applications
     */
    @Query("SELECT a FROM Application a JOIN FETCH a.candidate JOIN FETCH a.job")
    List<Application> findAllWithCandidateAndJob();

    /**
     * Find applications by job ID with candidate and job details
     * 
     * @param jobId the job ID
     * @return list of applications
     */
    @Query("SELECT a FROM Application a JOIN FETCH a.candidate JOIN FETCH a.job WHERE a.job.id = :jobId")
    List<Application> findByJobIdWithCandidateAndJob(@Param("jobId") Long jobId);

    /**
     * Find applications by status with candidate and job details
     * 
     * @param status the application status
     * @return list of applications
     */
    @Query("SELECT a FROM Application a JOIN FETCH a.candidate JOIN FETCH a.job WHERE a.status = :status")
    List<Application> findByStatusWithCandidateAndJob(@Param("status") ApplicationStatus status);

    /**
     * Find applications by job ID and status with candidate and job details
     * 
     * @param jobId the job ID
     * @param status the application status
     * @return list of applications
     */
    @Query("SELECT a FROM Application a JOIN FETCH a.candidate JOIN FETCH a.job WHERE a.job.id = :jobId AND a.status = :status")
    List<Application> findByJobIdAndStatusWithCandidateAndJob(@Param("jobId") Long jobId, @Param("status") ApplicationStatus status);
    
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
    
    /**
     * Find applications by job ID with search functionality
     * Searches across candidate name, email, current position, and current company
     * 
     * @param jobId the job ID
     * @param searchTerm the search term (case-insensitive)
     * @param pageable pagination information
     * @return a page of applications matching the search criteria
     */
    @Query("SELECT a FROM Application a " +
           "JOIN FETCH a.candidate c " +
           "WHERE a.job.id = :jobId " +
           "AND (LOWER(c.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(CONCAT(c.firstName, ' ', c.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(a.currentPosition) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(a.currentCompany) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Application> findByJobIdWithSearch(@Param("jobId") Long jobId, @Param("searchTerm") String searchTerm, Pageable pageable);
}

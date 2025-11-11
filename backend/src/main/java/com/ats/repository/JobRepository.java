package com.ats.repository;

import com.ats.model.Job;
import com.ats.model.JobStatus;
import com.ats.model.WorkSetting;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    
    // Find jobs by job status
    List<Job> findByJobStatusIn(List<JobStatus> statuses);

    
    // Search jobs by title or description
    List<Job> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String keyword, String keyword2);
    
    // Find jobs by work setting
    List<Job> findByWorkSetting(WorkSetting workSetting);
    
    // Find jobs by department
    List<Job> findByDepartment(String department);
    
    // Find jobs by employment type
    List<Job> findByEmploymentType(String employmentType);
    
    // Find jobs by salary range
    
    // Find jobs that should be expired (expiration date is today or in the past, and status is PUBLISHED or REOPENED)
    @Query("SELECT j FROM Job j WHERE j.expirationDate IS NOT NULL " +
           "AND j.expirationDate <= :today " +
           "AND j.jobStatus IN (com.ats.model.JobStatus.PUBLISHED, com.ats.model.JobStatus.REOPENED)")
    List<Job> findJobsToExpire(@Param("today") LocalDate today);
}

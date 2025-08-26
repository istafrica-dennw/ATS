package com.ats.service;

import com.ats.dto.SkeletonJobAssociationRequest;
import com.ats.dto.SkeletonWithJobsDTO;

import java.util.List;

public interface SkeletonJobAssociationService {
    
    /**
     * Associate a skeleton with multiple jobs
     */
    void associateSkeletonWithJobs(SkeletonJobAssociationRequest request, Long userId);
    
    /**
     * Remove association between skeleton and job
     */
    void removeSkeletonJobAssociation(Long skeletonId, Long jobId);
    
    /**
     * Get all skeletons with their job associations
     */
    List<SkeletonWithJobsDTO> getSkeletonsWithJobs();
    
    /**
     * Get skeleton IDs associated with a specific job
     */
    List<Long> getSkeletonIdsByJobId(Long jobId);
    
    /**
     * Get job IDs associated with a specific skeleton
     */
    List<Long> getJobIdsBySkeletonId(Long skeletonId);
    
    /**
     * Get all focus areas for skeletons associated with a job
     */
    List<String> getFocusAreasForJob(Long jobId);
    
    /**
     * Check if skeleton is associated with job
     */
    boolean isSkeletonAssociatedWithJob(Long skeletonId, Long jobId);
}
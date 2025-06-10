package com.ats.service;

import com.ats.dto.CreateInterviewSkeletonRequest;
import com.ats.dto.InterviewSkeletonDTO;

import java.util.List;
import java.util.Optional;

public interface InterviewSkeletonService {
    
    /**
     * Create a new interview skeleton
     */
    InterviewSkeletonDTO createSkeleton(CreateInterviewSkeletonRequest request, Long createdById);
    
    /**
     * Update an existing interview skeleton
     */
    InterviewSkeletonDTO updateSkeleton(Long skeletonId, CreateInterviewSkeletonRequest request, Long updatedById);
    
    /**
     * Get skeleton by ID
     */
    Optional<InterviewSkeletonDTO> getSkeletonById(Long skeletonId);
    
    /**
     * Get all skeletons for a job
     */
    List<InterviewSkeletonDTO> getSkeletonsByJobId(Long jobId);
    
    /**
     * Get all skeletons created by a user
     */
    List<InterviewSkeletonDTO> getSkeletonsByCreatedBy(Long createdById);
    
    /**
     * Delete a skeleton (only if no interviews are using it)
     */
    void deleteSkeleton(Long skeletonId);
    
    /**
     * Get all skeletons (admin view)
     */
    List<InterviewSkeletonDTO> getAllSkeletons();
} 
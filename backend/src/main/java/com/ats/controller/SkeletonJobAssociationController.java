package com.ats.controller;

import com.ats.dto.SkeletonJobAssociationRequest;
import com.ats.dto.SkeletonWithJobsDTO;
import com.ats.service.SkeletonJobAssociationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/skeleton-job-associations")
@RequiredArgsConstructor
@Slf4j
public class SkeletonJobAssociationController {

    private final SkeletonJobAssociationService associationService;

    /**
     * Associate a skeleton with multiple jobs
     * Admin only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> associateSkeletonWithJobs(
            @Valid @RequestBody SkeletonJobAssociationRequest request,
            Authentication authentication) {
        
        log.debug("Associating skeleton {} with jobs {}", request.getSkeletonId(), request.getJobIds());
        
        try {
            // TODO: Get user ID from authentication
            Long userId = 1L; // Placeholder - implement proper user extraction
            associationService.associateSkeletonWithJobs(request, userId);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error associating skeleton with jobs: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Remove association between skeleton and job
     * Admin only
     */
    @DeleteMapping("/skeleton/{skeletonId}/job/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeSkeletonJobAssociation(
            @PathVariable Long skeletonId,
            @PathVariable Long jobId) {
        
        log.debug("Removing association between skeleton {} and job {}", skeletonId, jobId);
        
        try {
            associationService.removeSkeletonJobAssociation(skeletonId, jobId);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error removing skeleton-job association: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get all skeletons with their job associations
     * Admin only
     */
    @GetMapping("/skeletons-with-jobs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SkeletonWithJobsDTO>> getSkeletonsWithJobs() {
        
        log.debug("Fetching all skeletons with their job associations");
        
        try {
            List<SkeletonWithJobsDTO> skeletons = associationService.getSkeletonsWithJobs();
            return ResponseEntity.ok(skeletons);
            
        } catch (Exception e) {
            log.error("Error fetching skeletons with jobs: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get skeleton IDs for a specific job
     * Admin only
     */
    @GetMapping("/job/{jobId}/skeletons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Long>> getSkeletonIdsByJobId(@PathVariable Long jobId) {
        
        log.debug("Fetching skeleton IDs for job {}", jobId);
        
        try {
            List<Long> skeletonIds = associationService.getSkeletonIdsByJobId(jobId);
            return ResponseEntity.ok(skeletonIds);
            
        } catch (Exception e) {
            log.error("Error fetching skeleton IDs for job: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get focus areas for a specific job
     * Admin only
     */
    @GetMapping("/job/{jobId}/focus-areas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> getFocusAreasForJob(@PathVariable Long jobId) {
        
        log.debug("Fetching focus areas for job {}", jobId);
        
        try {
            List<String> focusAreas = associationService.getFocusAreasForJob(jobId);
            return ResponseEntity.ok(focusAreas);
            
        } catch (Exception e) {
            log.error("Error fetching focus areas for job: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Check if skeleton is associated with job
     * Admin only
     */
    @GetMapping("/skeleton/{skeletonId}/job/{jobId}/exists")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Boolean> isSkeletonAssociatedWithJob(
            @PathVariable Long skeletonId,
            @PathVariable Long jobId) {
        
        log.debug("Checking if skeleton {} is associated with job {}", skeletonId, jobId);
        
        try {
            boolean isAssociated = associationService.isSkeletonAssociatedWithJob(skeletonId, jobId);
            return ResponseEntity.ok(isAssociated);
            
        } catch (Exception e) {
            log.error("Error checking skeleton-job association: {}", e.getMessage());
            throw e;
        }
    }
}
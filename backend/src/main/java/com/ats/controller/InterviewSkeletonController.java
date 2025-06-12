package com.ats.controller;

import com.ats.dto.CreateInterviewSkeletonRequest;
import com.ats.dto.InterviewSkeletonDTO;
import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.ats.service.InterviewSkeletonService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/interview-skeletons")
@Slf4j
public class InterviewSkeletonController {

    private final InterviewSkeletonService interviewSkeletonService;
    private final UserRepository userRepository;

    @Autowired
    public InterviewSkeletonController(InterviewSkeletonService interviewSkeletonService, UserRepository userRepository) {
        this.interviewSkeletonService = interviewSkeletonService;
        this.userRepository = userRepository;
    }

    /**
     * Create a new interview skeleton
     * Admin only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterviewSkeletonDTO> createSkeleton(
            @Valid @RequestBody CreateInterviewSkeletonRequest request,
            Authentication authentication) {
        
        log.info("Creating interview skeleton: {}", request.getName());
        
        try {
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            InterviewSkeletonDTO skeleton = interviewSkeletonService.createSkeleton(request, admin.getId());
            
            log.info("Interview skeleton created successfully with ID: {}", skeleton.getId());
            return new ResponseEntity<>(skeleton, HttpStatus.CREATED);
            
        } catch (Exception e) {
            log.error("Error creating interview skeleton: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Update an existing interview skeleton
     * Admin only
     */
    @PutMapping("/{skeletonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterviewSkeletonDTO> updateSkeleton(
            @PathVariable Long skeletonId,
            @Valid @RequestBody CreateInterviewSkeletonRequest request,
            Authentication authentication) {
        
        log.info("Updating interview skeleton: {}", skeletonId);
        
        try {
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
                    
            InterviewSkeletonDTO skeleton = interviewSkeletonService.updateSkeleton(skeletonId, request, admin.getId());
            
            log.info("Interview skeleton updated successfully: {}", skeletonId);
            return ResponseEntity.ok(skeleton);
            
        } catch (Exception e) {
            log.error("Error updating interview skeleton {}: {}", skeletonId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get interview skeleton by ID
     * Admin and Interviewer access
     */
    @GetMapping("/{skeletonId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTERVIEWER')")
    public ResponseEntity<InterviewSkeletonDTO> getSkeletonById(@PathVariable Long skeletonId) {
        
        log.debug("Fetching interview skeleton: {}", skeletonId);
        
        Optional<InterviewSkeletonDTO> skeleton = interviewSkeletonService.getSkeletonById(skeletonId);
        
        if (skeleton.isPresent()) {
            return ResponseEntity.ok(skeleton.get());
        } else {
            log.warn("Interview skeleton not found: {}", skeletonId);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all interview skeletons for a specific job
     * @deprecated Interview skeletons are now independent of jobs. Use getAllSkeletons() instead.
     * Admin and Interviewer access
     */
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTERVIEWER')")
    @Deprecated
    public ResponseEntity<List<InterviewSkeletonDTO>> getSkeletonsByJob(@PathVariable Long jobId) {
        
        log.debug("Deprecated endpoint called - returning all skeletons since they're no longer job-specific");
        
        List<InterviewSkeletonDTO> skeletons = interviewSkeletonService.getAllSkeletons();
        return ResponseEntity.ok(skeletons);
    }

    /**
     * Get all interview skeletons created by current admin
     * Admin only
     */
    @GetMapping("/my-skeletons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterviewSkeletonDTO>> getMySkeletons(Authentication authentication) {
        
        log.debug("Fetching skeletons created by current admin");
        
        try {
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
                    
            List<InterviewSkeletonDTO> skeletons = interviewSkeletonService.getSkeletonsByCreatedBy(admin.getId());
            return ResponseEntity.ok(skeletons);
            
        } catch (Exception e) {
            log.error("Error fetching admin's skeletons: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get all interview skeletons
     * Admin only
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterviewSkeletonDTO>> getAllSkeletons() {
        
        log.debug("Fetching all interview skeletons");
        
        List<InterviewSkeletonDTO> skeletons = interviewSkeletonService.getAllSkeletons();
        return ResponseEntity.ok(skeletons);
    }

    /**
     * Delete an interview skeleton
     * Admin only
     */
    @DeleteMapping("/{skeletonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSkeleton(@PathVariable Long skeletonId) {
        
        log.info("Deleting interview skeleton: {}", skeletonId);
        
        try {
            interviewSkeletonService.deleteSkeleton(skeletonId);
            log.info("Interview skeleton deleted successfully: {}", skeletonId);
            return ResponseEntity.noContent().build();
            
        } catch (IllegalStateException e) {
            log.warn("Cannot delete interview skeleton {}: {}", skeletonId, e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
            
        } catch (Exception e) {
            log.error("Error deleting interview skeleton {}: {}", skeletonId, e.getMessage());
            throw e;
        }
    }
} 
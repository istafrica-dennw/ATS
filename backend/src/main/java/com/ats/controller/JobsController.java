package com.ats.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ats.dto.JobDTO;
import com.ats.dto.UserDTO;
import com.ats.model.JobStatus;
import com.ats.model.User;
import com.ats.model.WorkSetting;
import com.ats.repository.UserRepository;
import com.ats.service.JobService;
import com.ats.service.RegionalDataFilterService;
import com.beust.jcommander.Parameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/jobs")
@Tag(name="Jobs Management", description=" APIs for managing jobs in the API System")
public class JobsController {
    
    private static final Logger logger = LoggerFactory.getLogger(JobsController.class);
    private final JobService jobService;
    private final RegionalDataFilterService regionalDataFilterService;
    private final UserRepository userRepository;

    public JobsController(JobService jobService, RegionalDataFilterService regionalDataFilterService, UserRepository userRepository){
        this.jobService = jobService;
        this.regionalDataFilterService = regionalDataFilterService;
        this.userRepository = userRepository;
    }
    
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }
    
    private boolean canAccessJobRegion(String jobRegion) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return true; // No user context, allow access (handled by security)
        }
        
        Boolean viewingAsNonEU = regionalDataFilterService.getViewModeFromSession(currentUser);
        
        // EU admin viewing as non-EU: can only access non-EU jobs
        if (regionalDataFilterService.isEUAdmin(currentUser) && Boolean.TRUE.equals(viewingAsNonEU)) {
            return !"EU".equals(jobRegion);
        }
        
        // EU admin in default mode: can only access EU jobs
        if (regionalDataFilterService.isEUAdmin(currentUser)) {
            return "EU".equals(jobRegion) || jobRegion == null || jobRegion.isEmpty();
        }
        
        // Non-EU admins can only access non-EU jobs
        if (regionalDataFilterService.isNonEUAdmin(currentUser)) {
            return !"EU".equals(jobRegion);
        }
        
        return true; // Default: allow access
    }

    @PostMapping
    @ApiResponses(value={
        @ApiResponse(
            responseCode = "201",
            description = "Job successfully created",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"id\": \"1\", \"title\":\"Software Engineer\", \"description\":\"Job description goes here\"   }"

                )
            )
        )
    })
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Create a new job",
        description = "Creates a new job in the system. job will be by default draft."
    )

    public ResponseEntity<JobDTO> createJob(
        @Valid @RequestBody JobDTO jobDTO) {
        logger.debug("Creating new job: {}", jobDTO);
        return ResponseEntity.ok(jobService.createJob(jobDTO));
    }
    
    @GetMapping
    @Operation(
        summary = "Get all jobs with filters",
        description = "get all jobs unpaginated"
    )
    public ResponseEntity<List<JobDTO>> getAllJobs(
        @RequestParam(required = false) List<JobStatus> jobStatuses,
        @RequestParam(required = false) List<WorkSetting> workSetting,
        @RequestParam(required = false) String description
    ) {
        logger.debug("Getting all jobs with filters - statuses: {}, workSettings: {}, description: {}", 
                    jobStatuses, workSetting, description);
        return ResponseEntity.ok(jobService.getAllJobs(jobStatuses,workSetting,description));
    }



    @GetMapping("/{id}")
    @Operation(
        summary = "Get job by ID",
        description = "Retrieves a specific job by its ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Job found",
            content = @Content(mediaType = "application/json")
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Job not found",
            content = @Content(mediaType = "application/json")
        )
    })
    public ResponseEntity<JobDTO> getJobById(@PathVariable("id") Long id) {
        logger.debug("Getting job with ID: {}", id);
        JobDTO job = jobService.getJobById(id);
        
        // Check regional access
        if (!canAccessJobRegion(job.getRegion())) {
            logger.warn("Access denied: User cannot access job ID {} in region {}", id, job.getRegion());
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Update job by ID",
        description = "Update a specific job by an its id "
    )
    public ResponseEntity<JobDTO> updatedJob( @Valid @RequestBody JobDTO jobDTO, @PathVariable Long id){
        logger.debug("Updating job with ID: {}", id);
        logger.debug("Job data: {}", jobDTO);
        
        // Check regional access before update
        JobDTO existingJob = jobService.getJobById(id);
        if (!canAccessJobRegion(existingJob.getRegion())) {
            logger.warn("Access denied: User cannot update job ID {} in region {}", id, existingJob.getRegion());
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(jobService.updateJob(jobDTO, id));
    }



    @PatchMapping("/{id}/status")
    @Operation(
        summary = "Update Status",
        description = "Update a specific job status by its id"
    )
    public ResponseEntity<JobDTO> updateJobStatus(@RequestBody Map<String, String> statusUpdate, @PathVariable Long id){
        logger.debug("Updating job status for job ID: {}", id);
        logger.debug("Status update payload: {}", statusUpdate);
        
        // Check regional access before status update
        JobDTO existingJob = jobService.getJobById(id);
        if (!canAccessJobRegion(existingJob.getRegion())) {
            logger.warn("Access denied: User cannot update status for job ID {} in region {}", id, existingJob.getRegion());
            return ResponseEntity.status(403).build();
        }
        
        String statusStr = statusUpdate.get("status");
        if (statusStr == null) {
            throw new IllegalArgumentException("Status field is required");
        }
        
        try {
            JobStatus jobStatus = JobStatus.valueOf(statusStr);
            logger.debug("Parsed job status: {}", jobStatus);
            return ResponseEntity.ok(jobService.updateJobStatus(jobStatus, id));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid job status: {}", statusStr, e);
            throw new IllegalArgumentException("Invalid job status: " + statusStr);
        }
    }
    
}


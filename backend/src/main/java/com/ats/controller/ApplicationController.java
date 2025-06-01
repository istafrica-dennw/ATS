package com.ats.controller;

import com.ats.dto.ApplicationDTO;
import com.ats.exception.AtsCustomExceptions.BadRequestException;
import com.ats.exception.AtsCustomExceptions.NotFoundException;
import com.ats.model.ApplicationStatus;
import com.ats.service.ApplicationService;
import com.ats.service.FileStorageService;
import com.ats.service.JobCustomQuestionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications", description = "APIs for managing job applications")
@Slf4j
public class ApplicationController {

    private final ApplicationService applicationService;
    private final JobCustomQuestionService jobCustomQuestionService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    @Autowired
    public ApplicationController(
            ApplicationService applicationService,
            JobCustomQuestionService jobCustomQuestionService,
            FileStorageService fileStorageService,
            ObjectMapper objectMapper) {
        this.applicationService = applicationService;
        this.jobCustomQuestionService = jobCustomQuestionService;
        this.fileStorageService = fileStorageService;
        this.objectMapper = objectMapper;
    }

    @Operation(summary = "Submit a job application", 
               description = "Submit a new job application with answers to custom questions")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Application submitted successfully",
                     content = @Content(schema = @Schema(implementation = ApplicationDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data or missing required questions"),
        @ApiResponse(responseCode = "404", description = "Job not found"),
        @ApiResponse(responseCode = "409", description = "Already applied to this job"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping
    public ResponseEntity<?> submitApplication(
            @Valid @RequestBody ApplicationDTO applicationDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            // Extract the user ID from the authenticated user
            // In a real implementation, you would extract the user ID from UserDetails
            // For now, we'll use a placeholder that would be replaced with actual code
            Long candidateId = extractUserIdFromUserDetails(userDetails);
            
            ApplicationDTO submittedApplication = applicationService.submitApplication(applicationDTO, candidateId);
            log.info("Application submitted successfully with ID: {}", submittedApplication.getId());
            
            return new ResponseEntity<>(submittedApplication, HttpStatus.CREATED);
            
        } catch (BadRequestException e) {
            log.warn("Bad request when submitting application: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            
        } catch (NotFoundException e) {
            log.warn("Resource not found when submitting application: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            log.error("Error submitting application", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "An error occurred while submitting the application", e);
        }
    }

    @Operation(summary = "Check application status", 
               description = "Check if the authenticated user has already applied to a specific job")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Returns application status"),
        @ApiResponse(responseCode = "404", description = "Job not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/check-status/{jobId}")
    public ResponseEntity<?> checkApplicationStatus(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            Long candidateId = extractUserIdFromUserDetails(userDetails);
            boolean hasApplied = applicationService.hasApplied(jobId, candidateId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasApplied", hasApplied);
            
            return ResponseEntity.ok(response);
            
        } catch (NotFoundException e) {
            log.warn("Resource not found when checking application status: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            log.error("Error checking application status", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "An error occurred while checking application status", e);
        }
    }

    @Operation(summary = "Get candidate's applications", 
               description = "Get all applications submitted by the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Returns paginated list of applications"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/my-applications")
    public ResponseEntity<Page<ApplicationDTO>> getMyApplications(
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            Long candidateId = extractUserIdFromUserDetails(userDetails);
            Page<ApplicationDTO> applications = applicationService.getApplicationsByCandidateId(candidateId, pageable);
            
            return ResponseEntity.ok(applications);
            
        } catch (Exception e) {
            log.error("Error getting applications for candidate", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "An error occurred while retrieving applications", e);
        }
    }

    @Operation(summary = "Get application by ID", 
               description = "Get details of a specific application by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Returns application details"),
        @ApiResponse(responseCode = "404", description = "Application not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - not authorized to view this application"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(
            @PathVariable("id") Long applicationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            ApplicationDTO application = applicationService.getApplicationById(applicationId);
            
            // Check if the user is authorized to view this application
            // Either the user is the candidate who submitted the application or an admin
            Long userId = extractUserIdFromUserDetails(userDetails);
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && !application.getCandidateId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "error", "You are not authorized to view this application"));
            }
            
            return ResponseEntity.ok(application);
            
        } catch (NotFoundException e) {
            log.warn("Application not found: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            log.error("Error getting application by ID", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "An error occurred while retrieving the application", e);
        }
    }

    @Operation(summary = "Get applications for a job", 
               description = "Get all applications for a specific job (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Returns paginated list of applications"),
        @ApiResponse(responseCode = "404", description = "Job not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getApplicationsByJobId(
            @PathVariable Long jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        
        try {
            Page<ApplicationDTO> applications;
            
            if (status != null) {
                applications = applicationService.getApplicationsByJobIdAndStatus(jobId, status, pageable);
            } else {
                applications = applicationService.getApplicationsByJobId(jobId, pageable);
            }
            
            return ResponseEntity.ok(applications);
            
        } catch (NotFoundException e) {
            log.warn("Job not found: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            log.error("Error getting applications for job", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "An error occurred while retrieving applications", e);
        }
    }

    @Operation(summary = "Update application status", 
               description = "Update the status of an application (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status updated successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found"),
        @ApiResponse(responseCode = "400", description = "Invalid status"),
        @ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable("id") Long applicationId,
            @RequestBody Map<String, String> statusUpdate) {
        
        try {
            if (!statusUpdate.containsKey("status")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Status is required"));
            }
            
            String statusStr = statusUpdate.get("status");
            ApplicationStatus newStatus;
            
            try {
                newStatus = ApplicationStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid status value: " + statusStr));
            }
            
            ApplicationDTO updatedApplication = applicationService.updateApplicationStatus(applicationId, newStatus);
            return ResponseEntity.ok(updatedApplication);
            
        } catch (NotFoundException e) {
            log.warn("Application not found: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            log.error("Error updating application status", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "An error occurred while updating application status", e);
        }
    }

    @Operation(summary = "Get job application statistics", 
               description = "Get statistics about applications for a specific job (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Returns application statistics"),
        @ApiResponse(responseCode = "404", description = "Job not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/stats/job/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getApplicationStatsByJobId(@PathVariable Long jobId) {
        try {
            Map<ApplicationStatus, Long> stats = applicationService.getApplicationStatsByJobId(jobId);
            return ResponseEntity.ok(stats);
            
        } catch (NotFoundException e) {
            log.warn("Job not found: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            log.error("Error getting application statistics", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "An error occurred while retrieving application statistics", e);
        }
    }


    @Operation(summary = "Delete an application", 
               description = "Delete an application (can be done by the candidate who submitted it or an admin)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Application deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - not authorized to delete this application"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(
            @PathVariable("id") Long applicationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            ApplicationDTO application = applicationService.getApplicationById(applicationId);
            
            // Check if the user is authorized to delete this application
            // Either the user is the candidate who submitted the application or an admin
            Long userId = extractUserIdFromUserDetails(userDetails);
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && !application.getCandidateId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "error", "You are not authorized to delete this application"));
            }
            
            boolean deleted = applicationService.deleteApplication(applicationId);
            
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                        "error", "Failed to delete application"));
            }
            
        } catch (NotFoundException e) {
            log.warn("Application not found: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            log.error("Error deleting application", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "An error occurred while deleting the application", e);
        }
    }
    
    /**
     * Extract user ID from the UserDetails object
     * This is a placeholder that would be replaced with actual implementation
     * 
     * @param userDetails the authenticated user details
     * @return the user ID
     */
    private Long extractUserIdFromUserDetails(UserDetails userDetails) {
        // In a real implementation, you would extract the user ID from UserDetails
        // based on how your UserDetails implementation stores the user ID
        // For example, if you have a custom UserDetails implementation:
        // return ((CustomUserDetails) userDetails).getUserId();
        
        // For now, this is a placeholder
        // You would replace this with your actual implementation
        // based on your security configuration
        return 1L; // Placeholder
    }
}

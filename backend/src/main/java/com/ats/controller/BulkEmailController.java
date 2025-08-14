package com.ats.controller;

import com.ats.dto.BulkEmailRequestDTO;
import com.ats.dto.BulkEmailResponseDTO;
import com.ats.model.Application;
import com.ats.model.ApplicationStatus;
import com.ats.model.User;
import com.ats.service.EmailService;
import com.ats.service.JobService;
import com.ats.dto.JobDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.ats.repository.UserRepository;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/bulk-email")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class BulkEmailController {

    private final EmailService emailService;
    private final JobService jobService;
    private final UserRepository userRepository;

    /**
     * Get preview of applicants that would receive the bulk email
     */
    @GetMapping("/preview")
    public ResponseEntity<Map<String, Object>> getEmailPreview(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) ApplicationStatus status) {
        
        try {
            List<Application> applications = emailService.getApplicantsForBulkEmail(jobId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalApplicants", applications.size());
            response.put("applicants", applications.stream().map(app -> {
                Map<String, Object> applicant = new HashMap<>();
                applicant.put("applicationId", app.getId());
                applicant.put("candidateName", app.getCandidate().getFirstName() + " " + app.getCandidate().getLastName());
                applicant.put("candidateEmail", app.getCandidate().getEmail());
                applicant.put("jobTitle", app.getJob().getTitle());
                applicant.put("status", app.getStatus());
                applicant.put("appliedDate", app.getCreatedAt());
                return applicant;
            }).toList());
            
            // Add filter information
            if (jobId != null) {
                try {
                    JobDTO job = jobService.getJobById(jobId);
                    response.put("jobTitle", job.getTitle());
                } catch (Exception e) {
                    response.put("jobTitle", "Job ID: " + jobId);
                }
            } else {
                response.put("jobTitle", "All Jobs");
            }
            
            response.put("statusFilter", status != null ? status.toString() : "All Statuses");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting email preview", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get email preview: " + e.getMessage()));
        }
    }

    /**
     * Send bulk email to applicants
     */
    @PostMapping("/send")
    public ResponseEntity<BulkEmailResponseDTO> sendBulkEmail(
            @Valid @RequestBody BulkEmailRequestDTO request,
            Authentication authentication) {
        
        try {
            // Get the current user from authentication
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            log.info("Admin {} sending bulk email to applicants. Job ID: {}, Status: {}", 
                currentUser.getEmail(), request.getJobId(), request.getStatus());
            
            BulkEmailResponseDTO response = emailService.sendBulkEmailToApplicants(request, currentUser);
            
            log.info("Bulk email completed. Success: {}, Failed: {}, Status: {}", 
                response.getSuccessCount(), response.getFailureCount(), response.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending bulk email", e);
            return ResponseEntity.badRequest().body(
                BulkEmailResponseDTO.builder()
                    .totalAttempted(0)
                    .successCount(0)
                    .failureCount(1)
                    .status("FAILED")
                    .failures(List.of(BulkEmailResponseDTO.FailedEmailDetail.builder()
                        .errorMessage("Failed to send bulk email: " + e.getMessage())
                        .build()))
                    .build()
            );
        }
    }

    /**
     * Get all available jobs for the dropdown
     */
    @GetMapping("/jobs")
    public ResponseEntity<List<Map<String, Object>>> getJobs() {
        try {
            List<JobDTO> jobs = jobService.getAllJobs(null, null, null);
            
            List<Map<String, Object>> jobsResponse = jobs.stream().map(job -> {
                Map<String, Object> jobMap = new HashMap<>();
                jobMap.put("id", job.getId());
                jobMap.put("title", job.getTitle());
                jobMap.put("department", job.getDepartment());
                jobMap.put("status", job.getJobStatus());
                return jobMap;
            }).toList();
            
            return ResponseEntity.ok(jobsResponse);
        } catch (Exception e) {
            log.error("Error fetching jobs for bulk email", e);
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    /**
     * Get all available application statuses
     */
    @GetMapping("/statuses")
    public ResponseEntity<List<Map<String, Object>>> getApplicationStatuses() {
        try {
            List<Map<String, Object>> statuses = List.of(
                Map.of("value", "APPLIED", "label", "Applied"),
                Map.of("value", "REVIEWED", "label", "Reviewed"),
                Map.of("value", "SHORTLISTED", "label", "Shortlisted"),
                Map.of("value", "INTERVIEWING", "label", "Interviewing"),
                Map.of("value", "OFFERED", "label", "Offered"),
                Map.of("value", "ACCEPTED", "label", "Accepted"),
                Map.of("value", "REJECTED", "label", "Rejected"),
                Map.of("value", "WITHDRAWN", "label", "Withdrawn"),
                Map.of("value", "OFFER_ACCEPTED", "label", "Offer Accepted"),
                Map.of("value", "OFFER_REJECTED", "label", "Offer Rejected")
            );
            
            return ResponseEntity.ok(statuses);
        } catch (Exception e) {
            log.error("Error fetching application statuses", e);
            return ResponseEntity.badRequest().body(List.of());
        }
    }
}
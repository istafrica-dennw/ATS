package com.ats.controller;

import com.ats.dto.*;
import com.ats.model.InterviewStatus;
import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.ats.service.InterviewService;
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
@RequestMapping("/api/interviews")
@Slf4j
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    @Autowired
    public InterviewController(InterviewService interviewService, UserRepository userRepository) {
        this.interviewService = interviewService;
        this.userRepository = userRepository;
    }

    /**
     * Assign an interview to an interviewer
     * Admin only
     */
    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterviewDTO> assignInterview(
            @Valid @RequestBody AssignInterviewRequest request,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            InterviewDTO interview = interviewService.assignInterview(request, admin.getId());
            return new ResponseEntity<>(interview, HttpStatus.CREATED);
            
        } catch (Exception e) {
            log.error("Error assigning interview: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Start an interview (change status to IN_PROGRESS)
     * Interviewer only (for their own interviews)
     */
    @PostMapping("/{interviewId}/start")
    @PreAuthorize("hasRole('INTERVIEWER')")
    public ResponseEntity<InterviewDTO> startInterview(
            @PathVariable Long interviewId,
            Authentication authentication) {
        
        try {
            String email = authentication.getName(); // get the email of the interviewer
            User interviewer = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Interviewer not found"));
            
            InterviewDTO interview = interviewService.startInterview(interviewId, interviewer.getId());
            return ResponseEntity.ok(interview);
            
        } catch (Exception e) {
            log.error("Error starting interview: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Submit interview responses
     * Interviewer only (for their own interviews)
     */
    @PostMapping("/{interviewId}/submit")
    @PreAuthorize("hasRole('INTERVIEWER')")
    public ResponseEntity<InterviewDTO> submitInterview(
            @PathVariable Long interviewId,
            @Valid @RequestBody SubmitInterviewRequest request,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User interviewer = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Interviewer not found"));
            
            InterviewDTO interview = interviewService.submitInterview(interviewId, request, interviewer.getId());
            return ResponseEntity.ok(interview);
            
        } catch (Exception e) {
            log.error("Error submitting interview: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get interview by ID
     * Admin and Interviewer access (interviewer only for their own interviews)
     */
    @GetMapping("/{interviewId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTERVIEWER')")
    public ResponseEntity<InterviewDTO> getInterviewById(
            @PathVariable Long interviewId,
            Authentication authentication) {
        
        Optional<InterviewDTO> interviewOpt = interviewService.getInterviewById(interviewId);
        
        if (interviewOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        InterviewDTO interview = interviewOpt.get();
        
        // Check if interviewer is trying to access their own interview
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!isAdmin && !interview.getInterviewerId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(interview);
    }

    /**
     * Get all interviews for current interviewer
     * Interviewer only
     */
    @GetMapping("/my-interviews")
    @PreAuthorize("hasRole('INTERVIEWER')")
    public ResponseEntity<List<InterviewDTO>> getMyInterviews(Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User interviewer = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Interviewer not found"));
            
            List<InterviewDTO> interviews = interviewService.getInterviewsByInterviewer(interviewer.getId());
            return ResponseEntity.ok(interviews);
            
        } catch (Exception e) {
            log.error("Error fetching interviews: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get interviews for current interviewer by status
     * Interviewer only
     */
    @GetMapping("/my-interviews/status/{status}")
    @PreAuthorize("hasRole('INTERVIEWER')")
    public ResponseEntity<List<InterviewDTO>> getMyInterviewsByStatus(
            @PathVariable InterviewStatus status,
            Authentication authentication) {
        
        log.debug("Fetching interviews for current interviewer with status: {}", status);
        
        try {
            String email = authentication.getName();
            User interviewer = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Interviewer not found"));
            
            List<InterviewDTO> interviews = interviewService.getInterviewsByInterviewerAndStatus(
                    interviewer.getId(), status);
            return ResponseEntity.ok(interviews);
            
        } catch (Exception e) {
            log.error("Error fetching interviewer's interviews by status: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get all interviews for an application
     * Admin only
     */
    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterviewDTO>> getInterviewsByApplication(@PathVariable Long applicationId) {
        
        List<InterviewDTO> interviews = interviewService.getInterviewsByApplication(applicationId);
        return ResponseEntity.ok(interviews);
    }

    /**
     * Get all interviews for a job
     * Admin only
     */
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterviewDTO>> getInterviewsByJob(@PathVariable Long jobId) {
        
        List<InterviewDTO> interviews = interviewService.getInterviewsByJob(jobId);
        return ResponseEntity.ok(interviews);
    }

    /**
     * Get all interviews assigned by current admin
     * Admin only
     */
    @GetMapping("/assigned-by-me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterviewDTO>> getInterviewsAssignedByMe(Authentication authentication) {
        
        log.debug("Fetching interviews assigned by current admin");
        
        try {
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            List<InterviewDTO> interviews = interviewService.getInterviewsAssignedBy(admin.getId());
            return ResponseEntity.ok(interviews);
            
        } catch (Exception e) {
            log.error("Error fetching admin's assigned interviews: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get all completed interviews for admin results viewing
     * Admin only
     */
    @GetMapping("/completed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterviewDTO>> getAllCompletedInterviews() {
        
        log.debug("Fetching all completed interviews for admin results viewing");
        
        try {
            List<InterviewDTO> interviews = interviewService.getAllCompletedInterviews();
            return ResponseEntity.ok(interviews);
            
        } catch (Exception e) {
            log.error("Error fetching completed interviews: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Shortlist an application
     * Admin only
     */
    @PostMapping("/applications/{applicationId}/shortlist")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> shortlistApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            interviewService.shortlistApplication(applicationId, admin.getId());
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error shortlisting application: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get shortlisted applications for a job
     * Admin only
     */
    @GetMapping("/applications/shortlisted/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterviewDTO.ApplicationSummaryDTO>> getShortlistedApplications(
            @PathVariable Long jobId) {
        
        List<InterviewDTO.ApplicationSummaryDTO> applications = interviewService.getShortlistedApplications(jobId);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get all shortlisted applications across all jobs
     * Admin only
     */
    @GetMapping("/applications/shortlisted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterviewDTO.ApplicationSummaryDTO>> getAllShortlistedApplications() {
        
        List<InterviewDTO.ApplicationSummaryDTO> applications = interviewService.getAllShortlistedApplications();
        return ResponseEntity.ok(applications);
    }

    /**
     * Get available interviewers
     * Admin only
     */
    @GetMapping("/interviewers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAvailableInterviewers() {
        
        List<UserDTO> interviewers = interviewService.getAvailableInterviewers();
        return ResponseEntity.ok(interviewers);
    }

    /**
     * Get interviews for current candidate (by their applications)
     * Candidate only
     */
    @GetMapping("/my-candidate-interviews")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<InterviewDTO>> getMyCandidateInterviews(Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User candidate = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Candidate not found"));
            
            List<InterviewDTO> interviews = interviewService.getInterviewsForCandidate(candidate.getId());
            return ResponseEntity.ok(interviews);
            
        } catch (Exception e) {
            log.error("Error fetching candidate interviews: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Cancel an interview assignment
     * Admin only
     */
    @DeleteMapping("/{interviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cancelInterview(
            @PathVariable Long interviewId,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            interviewService.cancelInterview(interviewId, admin.getId());
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error cancelling interview: {}", e.getMessage());
            throw e;
        }
    }
} 
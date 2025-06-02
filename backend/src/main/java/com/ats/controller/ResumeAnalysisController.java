package com.ats.controller;

import com.ats.dto.ResumeAnalysisDTO;
import com.ats.model.Application;
import com.ats.model.Job;
import com.ats.repository.ApplicationRepository;
import com.ats.repository.JobRepository;
import com.ats.service.ResumeAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/resume-analysis")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Resume Analysis", description = "AI-powered resume analysis and scoring")
public class ResumeAnalysisController {

    private final ResumeAnalysisService resumeAnalysisService;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    @PostMapping("/analyze")
    @Operation(summary = "Analyze a resume file", description = "Upload and analyze a resume file using AI")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resume analyzed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file format or missing parameters"),
            @ApiResponse(responseCode = "500", description = "Analysis failed")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<ResumeAnalysisDTO> analyzeResume(
            @Parameter(description = "Resume file to analyze", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Job ID for scoring context", required = true)
            @RequestParam("jobId") Long jobId) {
        
        log.info("Analyzing resume file: {} for job ID: {}", file.getOriginalFilename(), jobId);
        
        try {
            // Validate file format
            if (!resumeAnalysisService.isSupportedResumeFormat(file)) {
                return ResponseEntity.badRequest().build();
            }
            
            // Get job for context
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            
            // Analyze resume
            ResumeAnalysisDTO analysis = resumeAnalysisService.analyzeResume(file, job);
            
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("Error analyzing resume: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/analyze-async")
    @Operation(summary = "Analyze a resume file asynchronously", description = "Upload and analyze a resume file using AI (async)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Analysis started"),
            @ApiResponse(responseCode = "400", description = "Invalid file format or missing parameters"),
            @ApiResponse(responseCode = "500", description = "Analysis failed to start")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<String> analyzeResumeAsync(
            @Parameter(description = "Resume file path", required = true)
            @RequestParam("filePath") String filePath,
            @Parameter(description = "Job ID for scoring context", required = true)
            @RequestParam("jobId") Long jobId) {
        
        log.info("Starting async analysis for file: {} and job ID: {}", filePath, jobId);
        
        try {
            // Get job for context
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            
            // Start async analysis
            CompletableFuture<ResumeAnalysisDTO> future = resumeAnalysisService.analyzeResumeAsync(filePath, job);
            
            return ResponseEntity.accepted().body("Analysis started");
            
        } catch (Exception e) {
            log.error("Error starting async analysis: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Failed to start analysis");
        }
    }

    @PostMapping("/applications/{applicationId}/analyze")
    @Operation(summary = "Analyze resume for an application", description = "Trigger resume analysis for a specific application")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Analysis started"),
            @ApiResponse(responseCode = "404", description = "Application not found"),
            @ApiResponse(responseCode = "500", description = "Analysis failed to start")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<String> analyzeApplicationResume(
            @Parameter(description = "Application ID", required = true)
            @PathVariable Long applicationId) {
        
        log.info("Analyzing resume for application ID: {}", applicationId);
        
        try {
            // Get application
            Application application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            
            // Check if resume URL exists
            if (application.getResumeUrl() == null || application.getResumeUrl().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("No resume URL found for this application");
            }
            
            // Start analysis
            CompletableFuture<Application> future = resumeAnalysisService.analyzeAndUpdateApplication(application, application.getJob());
            
            return ResponseEntity.accepted().body("Resume analysis started for application " + applicationId);
            
        } catch (Exception e) {
            log.error("Error analyzing application resume: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Failed to start analysis");
        }
    }

    @GetMapping("/applications/{applicationId}")
    @Operation(summary = "Get resume analysis for an application", description = "Retrieve the resume analysis results for a specific application")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Analysis retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Application not found or no analysis available"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or (hasRole('CANDIDATE') and @applicationRepository.findById(#applicationId).orElse(null)?.candidate?.id == authentication.principal.id)")
    public ResponseEntity<ResumeAnalysisDTO> getApplicationAnalysis(
            @Parameter(description = "Application ID", required = true)
            @PathVariable Long applicationId) {
        
        log.info("Getting resume analysis for application ID: {}", applicationId);
        
        try {
            // Get application
            Application application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            
            // Check if analysis exists
            if (application.getResumeAnalysis() == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(application.getResumeAnalysis());
            
        } catch (Exception e) {
            log.error("Error getting application analysis: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/rescore")
    @Operation(summary = "Re-score resume analysis for a different job", description = "Re-calculate scoring for existing analysis against a different job")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Re-scoring completed"),
            @ApiResponse(responseCode = "404", description = "Application or job not found"),
            @ApiResponse(responseCode = "400", description = "No existing analysis found")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<ResumeAnalysisDTO> rescoreAnalysis(
            @Parameter(description = "Application ID", required = true)
            @RequestParam("applicationId") Long applicationId,
            @Parameter(description = "New Job ID for re-scoring", required = true)
            @RequestParam("newJobId") Long newJobId) {
        
        log.info("Re-scoring analysis for application {} against job {}", applicationId, newJobId);
        
        try {
            // Get application
            Application application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            
            // Check if analysis exists
            if (application.getResumeAnalysis() == null) {
                return ResponseEntity.badRequest().build();
            }
            
            // Get new job
            Job newJob = jobRepository.findById(newJobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            
            // Re-score
            ResumeAnalysisDTO rescored = resumeAnalysisService.rescoreForJob(application.getResumeAnalysis(), newJob);
            
            return ResponseEntity.ok(rescored);
            
        } catch (Exception e) {
            log.error("Error re-scoring analysis: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 
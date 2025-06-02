package com.ats.service;

import com.ats.dto.ResumeAnalysisDTO;
import com.ats.model.Application;
import com.ats.model.Job;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.CompletableFuture;

/**
 * Service for analyzing resumes using AI to extract work experience, skills,
 * and calculate job-specific matching scores.
 */
public interface ResumeAnalysisService {

    /**
     * Analyze a resume file (MultipartFile) and extract structured data
     * 
     * @param resumeFile The uploaded resume file
     * @param job The job posting for scoring comparison
     * @return AI-extracted resume analysis data
     */
    ResumeAnalysisDTO analyzeResume(MultipartFile resumeFile, Job job);

    /**
     * Analyze a resume from file path
     * 
     * @param resumeFilePath Path to the resume file
     * @param job The job posting for scoring comparison
     * @return AI-extracted resume analysis data
     */
    ResumeAnalysisDTO analyzeResume(String resumeFilePath, Job job);

    /**
     * Asynchronously analyzes a resume file path
     * @param resumeFilePath Path to the resume file
     * @param job The job for scoring relevance
     * @return CompletableFuture containing resume analysis
     */
    CompletableFuture<ResumeAnalysisDTO> analyzeResumeAsync(String resumeFilePath, Job job);

    /**
     * Updates an application with resume analysis results
     * @param application The application to update
     * @param analysis The resume analysis to store
     * @return Updated application
     */
    Application updateApplicationWithAnalysis(Application application, ResumeAnalysisDTO analysis);

    /**
     * Analyzes and updates application with resume analysis
     * @param application The application with resume to analyze
     * @param job The job for context scoring
     * @return CompletableFuture containing updated application
     */
    CompletableFuture<Application> analyzeAndUpdateApplication(Application application, Job job);

    /**
     * Re-score an existing resume analysis against a different job
     * 
     * @param existingAnalysis Previous analysis data
     * @param job New job posting for comparison
     * @return Updated analysis with new scoring
     */
    ResumeAnalysisDTO rescoreForJob(ResumeAnalysisDTO existingAnalysis, Job job);

    /**
     * Extract text content from various resume formats (PDF, DOC, DOCX)
     * 
     * @param resumeFile The resume file
     * @return Extracted text content
     */
    String extractTextFromResume(MultipartFile resumeFile);

    /**
     * Validate if a file is a supported resume format
     * 
     * @param file The file to validate
     * @return true if supported format, false otherwise
     */
    boolean isSupportedResumeFormat(MultipartFile file);
} 
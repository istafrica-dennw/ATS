package com.ats.service;

import com.ats.dto.AssignInterviewRequest;
import com.ats.dto.InterviewDTO;
import com.ats.dto.SubmitInterviewRequest;
import com.ats.model.InterviewStatus;

import java.util.List;
import java.util.Optional;

public interface InterviewService {
    
    /**
     * Assign an interview to an interviewer
     */
    InterviewDTO assignInterview(AssignInterviewRequest request, Long assignedById);
    
    /**
     * Get interview by ID
     */
    Optional<InterviewDTO> getInterviewById(Long interviewId);
    
    /**
     * Get all interviews for an interviewer
     */
    List<InterviewDTO> getInterviewsByInterviewer(Long interviewerId);
    
    /**
     * Get interviews for an interviewer by status
     */
    List<InterviewDTO> getInterviewsByInterviewerAndStatus(Long interviewerId, InterviewStatus status);
    
    /**
     * Get all interviews for an application
     */
    List<InterviewDTO> getInterviewsByApplication(Long applicationId);
    
    /**
     * Get all interviews for a job
     */
    List<InterviewDTO> getInterviewsByJob(Long jobId);
    
    /**
     * Submit interview responses
     */
    InterviewDTO submitInterview(Long interviewId, SubmitInterviewRequest request, Long interviewerId);
    
    /**
     * Start an interview (change status to IN_PROGRESS)
     */
    InterviewDTO startInterview(Long interviewId, Long interviewerId);
    
    /**
     * Get all interviews assigned by an admin
     */
    List<InterviewDTO> getInterviewsAssignedBy(Long assignedById);
    
    /**
     * Shortlist an application
     */
    void shortlistApplication(Long applicationId, Long adminId);
    
    /**
     * Shortlist an application by setting both status and flag
     */
    void shortlistApplicationById(Long applicationId, Long adminId);
    
    /**
     * Get shortlisted applications for a job
     */
    List<InterviewDTO.ApplicationSummaryDTO> getShortlistedApplications(Long jobId);
    
    /**
     * Get all shortlisted applications across all jobs
     */
    List<InterviewDTO.ApplicationSummaryDTO> getAllShortlistedApplications();
    
    /**
     * Get available interviewers (users with INTERVIEWER role)
     */
    List<com.ats.dto.UserDTO> getAvailableInterviewers();
    
    /**
     * Get interviews for a candidate (by their applications)
     */
    List<InterviewDTO> getInterviewsForCandidate(Long candidateId);
    
    /**
     * Cancel/delete an interview assignment
     */
    void cancelInterview(Long interviewId, Long adminId);
} 
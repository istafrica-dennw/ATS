package com.ats.service.impl;

import com.ats.dto.AssignInterviewRequest;
import com.ats.dto.InterviewDTO;
import com.ats.dto.SubmitInterviewRequest;
import com.ats.dto.UserDTO;
import com.ats.exception.ResourceNotFoundException;
import com.ats.model.*;
import com.ats.repository.*;
import com.ats.service.InterviewService;
import com.ats.service.EmailService;
import com.ats.service.CalendarService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final InterviewSkeletonRepository interviewSkeletonRepository;
    private final JobRepository jobRepository;
    private final EmailService emailService;
    private final CalendarService calendarService;

    @Autowired
    public InterviewServiceImpl(
            InterviewRepository interviewRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            InterviewSkeletonRepository interviewSkeletonRepository,
            JobRepository jobRepository,
            EmailService emailService,
            CalendarService calendarService) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.interviewSkeletonRepository = interviewSkeletonRepository;
        this.jobRepository = jobRepository;
        this.emailService = emailService;
        this.calendarService = calendarService;
    }

    @Override
    public InterviewDTO assignInterview(AssignInterviewRequest request, Long assignedById) {
        log.info("Assigning interview for application {} to interviewer {} by admin {}", 
                request.getApplicationId(), request.getInterviewerId(), assignedById);

        // Validate application exists and is shortlisted
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + request.getApplicationId()));
        
        if (!Boolean.TRUE.equals(application.getIsShortlisted())) {
            throw new IllegalStateException("Application must be shortlisted before assigning interview");
        }

        // Validate interviewer exists and has INTERVIEWER role
        User interviewer = userRepository.findById(request.getInterviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found with ID: " + request.getInterviewerId()));
        
        if (!interviewer.hasRole(Role.INTERVIEWER)) {
            throw new IllegalStateException("User must have INTERVIEWER role to be assigned an interview");
        }

        // Validate skeleton exists
        InterviewSkeleton skeleton = interviewSkeletonRepository.findById(request.getSkeletonId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview skeleton not found with ID: " + request.getSkeletonId()));

        // Validate admin exists
        User admin = userRepository.findById(assignedById)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + assignedById));

        // Check if interview already exists for this application-interviewer-skeleton combination
        Optional<Interview> existingInterview = interviewRepository
                .findByApplicationIdAndInterviewerIdAndSkeletonId(
                        request.getApplicationId(), 
                        request.getInterviewerId(), 
                        request.getSkeletonId());
        
        if (existingInterview.isPresent()) {
            throw new IllegalStateException("Interview already assigned for this combination");
        }

        // Validate location address for office interviews
        if (request.getLocationType() == LocationType.OFFICE && 
            (request.getLocationAddress() == null || request.getLocationAddress().trim().isEmpty())) {
            throw new IllegalArgumentException("Location address is required for office interviews");
        }

        // Create interview
        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setInterviewer(interviewer);
        interview.setSkeleton(skeleton);
        interview.setStatus(InterviewStatus.ASSIGNED);
        interview.setScheduledAt(request.getScheduledAt());
        interview.setDurationMinutes(request.getDurationMinutes());
        interview.setLocationType(request.getLocationType());
        interview.setLocationAddress(request.getLocationAddress());
        interview.setAssignedBy(admin);
        interview.setNotes(request.getNotes());

        // Initialize empty responses based on skeleton focus areas
        List<Interview.InterviewResponse> responses = skeleton.getFocusAreas().stream()
                .map(fa -> new Interview.InterviewResponse(fa.getTitle(), "", 0))
                .collect(Collectors.toList());
        interview.setResponses(responses);

        // Save and return DTO
        Interview savedInterview = interviewRepository.save(interview);
        log.info("Interview assigned with ID: {}", savedInterview.getId());

        // Send email notifications using event-based system
        try {
            // Send email to interviewer
            emailService.sendInterviewEmail(savedInterview, EmailEvent.INTERVIEW_ASSIGNED_TO_INTERVIEWER);
            log.info("Interview assignment email sent to interviewer for interview ID: {}", savedInterview.getId());
        } catch (Exception e) {
            log.error("Failed to send interview assignment email to interviewer for interview ID: {}: {}", 
                     savedInterview.getId(), e.getMessage());
            // Don't fail the entire operation if email fails - email is saved with FAILED status
        }
        
        try {
            // Send email to candidate
            emailService.sendInterviewEmail(savedInterview, EmailEvent.INTERVIEW_ASSIGNED_TO_CANDIDATE);
            log.info("Interview assignment email sent to candidate for interview ID: {}", savedInterview.getId());
        } catch (Exception e) {
            log.error("Failed to send interview assignment email to candidate for interview ID: {}: {}", 
                     savedInterview.getId(), e.getMessage());
            // Don't fail the entire operation if email fails - email is saved with FAILED status
        }
        
        // Always send calendar invites
        if (savedInterview.getScheduledAt() != null) {
            try {
                calendarService.sendCalendarInvites(savedInterview);
                log.info("Calendar invites sent successfully for interview ID: {}", savedInterview.getId());
            } catch (Exception e) {
                log.error("Failed to send calendar invites for interview ID: {}: {}", 
                         savedInterview.getId(), e.getMessage());
                // Don't fail the entire operation if calendar invite fails
            }
        }

        return mapToDTO(savedInterview);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<InterviewDTO> getInterviewById(Long interviewId) {
        log.debug("Fetching interview with ID: {}", interviewId);
        return interviewRepository.findById(interviewId)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO> getInterviewsByInterviewer(Long interviewerId) {
        log.debug("Fetching interviews for interviewer ID: {}", interviewerId);
        return interviewRepository.findByInterviewerId(interviewerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO> getInterviewsByInterviewerAndStatus(Long interviewerId, InterviewStatus status) {
        log.debug("Fetching interviews for interviewer {} with status {}", interviewerId, status);
        return interviewRepository.findByInterviewerIdAndStatus(interviewerId, status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO> getInterviewsByApplication(Long applicationId) {
        log.debug("Fetching interviews for application ID: {}", applicationId);
        return interviewRepository.findByApplicationId(applicationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO> getInterviewsByJob(Long jobId) {
        log.debug("Fetching interviews for job ID: {}", jobId);
        return interviewRepository.findByJobId(jobId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InterviewDTO submitInterview(Long interviewId, SubmitInterviewRequest request, Long interviewerId) {
        log.info("Submitting interview {} by interviewer {}", interviewId, interviewerId);

        // Validate interview exists and belongs to interviewer
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with ID: " + interviewId));

        if (!interview.getInterviewer().getId().equals(interviewerId)) {
            throw new IllegalStateException("Interview does not belong to this interviewer");
        }

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new IllegalStateException("Interview must be in progress to submit responses");
        }

        // Update responses
        List<Interview.InterviewResponse> responses = request.getResponses().stream()
                .map(r -> new Interview.InterviewResponse(r.getTitle(), r.getFeedback(), r.getRating()))
                .collect(Collectors.toList());
        interview.setResponses(responses);

        // Update status and completion time
        interview.setStatus(InterviewStatus.COMPLETED);
        interview.setCompletedAt(LocalDateTime.now());

        // Save and return DTO
        Interview updatedInterview = interviewRepository.save(interview);
        log.info("Interview {} submitted successfully", interviewId);

        return mapToDTO(updatedInterview);
    }

    @Override
    public InterviewDTO startInterview(Long interviewId, Long interviewerId) {
        log.info("Starting interview {} by interviewer {}", interviewId, interviewerId);

        // Validate interview exists and belongs to interviewer
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with ID: " + interviewId));

        if (!interview.getInterviewer().getId().equals(interviewerId)) {
            throw new IllegalStateException("Interview does not belong to this interviewer");
        }

        if (interview.getStatus() != InterviewStatus.ASSIGNED) {
            throw new IllegalStateException("Interview must be in ASSIGNED status to start");
        }

        // Update status
        interview.setStatus(InterviewStatus.IN_PROGRESS);

        // Save and return DTO
        Interview updatedInterview = interviewRepository.save(interview);
        log.info("Interview {} started successfully", interviewId);

        return mapToDTO(updatedInterview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO> getInterviewsAssignedBy(Long assignedById) {
        log.debug("Fetching interviews assigned by admin ID: {}", assignedById);
        return interviewRepository.findByAssignedById(assignedById).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO> getAllCompletedInterviews() {
        log.debug("Fetching all completed interviews for admin results viewing");
        return interviewRepository.findByStatus(InterviewStatus.COMPLETED).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO> getAllInterviews() {
        log.debug("Fetching all interviews for admin assignment management");
        return interviewRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void shortlistApplication(Long applicationId, Long adminId) {
        log.info("Shortlisting application {} by admin {}", applicationId, adminId);

        // Validate application exists
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        // Validate admin exists
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        // Update application
        application.setIsShortlisted(true);
        application.setShortlistedAt(java.time.ZonedDateTime.now());
        application.setShortlistedBy(admin);

        applicationRepository.save(application);
        log.info("Application {} shortlisted successfully", applicationId);
    }

    @Override
    public void shortlistApplicationById(Long applicationId, Long adminId) {
        log.info("Shortlisting application {} by admin {} (setting status and flag)", applicationId, adminId);

        // Validate application exists
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        // Validate admin exists
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        // Update application - set both status and shortlisted flag
        application.setStatus(ApplicationStatus.SHORTLISTED);
        application.setIsShortlisted(true);
        application.setShortlistedAt(java.time.ZonedDateTime.now());
        application.setShortlistedBy(admin);
        application.setUpdatedAt(java.time.ZonedDateTime.now());

        applicationRepository.save(application);
        log.info("Application {} shortlisted successfully with status and flag", applicationId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO.ApplicationSummaryDTO> getShortlistedApplications(Long jobId) {
        log.debug("Fetching shortlisted applications for job ID: {}", jobId);
        return applicationRepository.findByJobIdAndIsShortlisted(jobId, true).stream()
                .map(this::mapToApplicationSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO.ApplicationSummaryDTO> getAllShortlistedApplications() {
        log.debug("Fetching all shortlisted applications across all jobs");
        return applicationRepository.findByIsShortlisted(true).stream()
                .map(this::mapToApplicationSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getAvailableInterviewers() {
        log.debug("Fetching available interviewers");
        return userRoleRepository.findUsersByRole(Role.INTERVIEWER).stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDTO> getInterviewsForCandidate(Long candidateId) {
        log.debug("Fetching interviews for candidate ID: {}", candidateId);
        return interviewRepository.findByCandidateId(candidateId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelInterview(Long interviewId, Long adminId) {
        log.info("Cancelling interview {} by admin {}", interviewId, adminId);

        // Validate interview exists
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with ID: " + interviewId));

        // Validate admin exists
        userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        // Only allow cancellation if interview is not yet completed
        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed interview");
        }

        // Delete the interview FIRST
        interviewRepository.delete(interview);
        log.info("Interview {} cancelled successfully by admin {}", interviewId, adminId);

        // Send email notifications AFTER successful deletion
        try {
            // Send email to interviewer
            emailService.sendInterviewEmail(interview, EmailEvent.INTERVIEW_CANCELLED_TO_INTERVIEWER);
            log.info("Interview cancellation email sent to interviewer for interview ID: {}", interviewId);
        } catch (Exception e) {
            log.error("Failed to send interview cancellation email to interviewer for interview ID: {}: {}", 
                     interviewId, e.getMessage());
            // Don't fail the entire operation if email fails - email is saved with FAILED status
        }
        
        try {
            // Send email to candidate
            emailService.sendInterviewEmail(interview, EmailEvent.INTERVIEW_CANCELLED_TO_CANDIDATE);
            log.info("Interview cancellation email sent to candidate for interview ID: {}", interviewId);
        } catch (Exception e) {
            log.error("Failed to send interview cancellation email to candidate for interview ID: {}: {}", 
                     interviewId, e.getMessage());
            // Don't fail the entire operation if email fails - email is saved with FAILED status
        }
    }


    private InterviewDTO mapToDTO(Interview interview) {
        InterviewDTO dto = new InterviewDTO();
        dto.setId(interview.getId());
        dto.setApplicationId(interview.getApplication().getId());
        dto.setInterviewerId(interview.getInterviewer().getId());
        dto.setInterviewerName(interview.getInterviewer().getFirstName() + " " + interview.getInterviewer().getLastName());
        dto.setInterviewerEmail(interview.getInterviewer().getEmail());
        dto.setSkeletonId(interview.getSkeleton().getId());
        dto.setSkeletonName(interview.getSkeleton().getName());
        dto.setStatus(interview.getStatus());
        dto.setScheduledAt(interview.getScheduledAt());
        dto.setDurationMinutes(interview.getDurationMinutes());
        dto.setLocationType(interview.getLocationType());
        dto.setLocationAddress(interview.getLocationAddress());
        dto.setCompletedAt(interview.getCompletedAt());
        dto.setAssignedById(interview.getAssignedBy().getId());
        dto.setAssignedByName(interview.getAssignedBy().getFirstName() + " " + interview.getAssignedBy().getLastName());
        dto.setCreatedAt(interview.getCreatedAt().atZone(java.time.ZoneId.systemDefault()));
        dto.setUpdatedAt(interview.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()));

        // Map responses
        List<InterviewDTO.InterviewResponseDTO> responseDTOs = interview.getResponses().stream()
                .map(r -> new InterviewDTO.InterviewResponseDTO(r.getTitle(), r.getFeedback(), r.getRating()))
                .collect(Collectors.toList());
        dto.setResponses(responseDTOs);

        // Map application summary
        dto.setApplication(mapToApplicationSummaryDTO(interview.getApplication()));

        // Map skeleton info
        dto.setSkeleton(mapSkeletonToDTO(interview.getSkeleton()));

        return dto;
    }

    private InterviewDTO.ApplicationSummaryDTO mapToApplicationSummaryDTO(Application application) {
        InterviewDTO.ApplicationSummaryDTO dto = new InterviewDTO.ApplicationSummaryDTO();
        dto.setId(application.getId());
        dto.setCandidateName(application.getCandidate().getFirstName() + " " + application.getCandidate().getLastName());
        dto.setCandidateEmail(application.getCandidate().getEmail());
        dto.setCandidateProfilePictureUrl(application.getCandidate().getProfilePictureUrl());
        dto.setCandidateLinkedinProfileUrl(application.getCandidate().getLinkedinProfileUrl());
        dto.setJobId(application.getJob().getId());
        dto.setJobTitle(application.getJob().getTitle());
        dto.setResumeUrl(application.getResumeUrl());
        dto.setAppliedAt(application.getCreatedAt());
        
        // Include resume analysis for interviewers
        if (application.getResumeAnalysis() != null) {
            dto.setResumeAnalysis(mapResumeAnalysisToDTO(application.getResumeAnalysis()));
        }
        
        return dto;
    }

    private com.ats.dto.InterviewSkeletonDTO mapSkeletonToDTO(InterviewSkeleton skeleton) {
        com.ats.dto.InterviewSkeletonDTO dto = new com.ats.dto.InterviewSkeletonDTO();
        dto.setId(skeleton.getId());
        dto.setName(skeleton.getName());
        dto.setDescription(skeleton.getDescription());
        
        // Map focus areas
        List<com.ats.dto.InterviewSkeletonDTO.FocusAreaDTO> focusAreaDTOs = skeleton.getFocusAreas().stream()
                .map(fa -> new com.ats.dto.InterviewSkeletonDTO.FocusAreaDTO(fa.getTitle(), fa.getDescription()))
                .collect(Collectors.toList());
        dto.setFocusAreas(focusAreaDTOs);
        
        return dto;
    }

    private UserDTO mapToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }

    private com.ats.dto.ResumeAnalysisDTO mapResumeAnalysisToDTO(com.ats.dto.ResumeAnalysisDTO resumeAnalysis) {
        // ResumeAnalysis is already stored as DTO in the Application entity
        return resumeAnalysis;
    }
} 
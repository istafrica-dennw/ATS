package com.ats.service.impl;

import com.ats.dto.ApplicationAnswerDTO;
import com.ats.dto.ApplicationDTO;
import com.ats.exception.AtsCustomExceptions.BadRequestException;
import com.ats.exception.AtsCustomExceptions.NotFoundException;
import com.ats.model.*;
import com.ats.repository.ApplicationAnswerRepository;
import com.ats.repository.ApplicationRepository;
import com.ats.repository.JobCustomQuestionRepository;
import com.ats.repository.JobRepository;
import com.ats.repository.UserRepository;
import com.ats.service.ApplicationService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationAnswerRepository applicationAnswerRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobCustomQuestionRepository jobCustomQuestionRepository;

    @Autowired
    public ApplicationServiceImpl(
            ApplicationRepository applicationRepository,
            ApplicationAnswerRepository applicationAnswerRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            JobCustomQuestionRepository jobCustomQuestionRepository) {
        this.applicationRepository = applicationRepository;
        this.applicationAnswerRepository = applicationAnswerRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jobCustomQuestionRepository = jobCustomQuestionRepository;
    }

    @Override
    @Transactional
    public ApplicationDTO submitApplication(ApplicationDTO applicationDTO, Long candidateId) {
        log.info("Submitting application for job ID: {} by candidate ID: {}", applicationDTO.getJobId(), candidateId);
        
        // Check if the candidate has already applied to this job
        if (hasApplied(applicationDTO.getJobId(), candidateId)) {
            throw new BadRequestException("You have already applied to this job.");
        }
        
        // Validate job exists
        Job job = jobRepository.findById(applicationDTO.getJobId())
                .orElseThrow(() -> new NotFoundException("Job not found with ID: " + applicationDTO.getJobId()));
        
        // Validate job is published/open
        if (job.getJobStatus() != JobStatus.PUBLISHED && job.getJobStatus() != JobStatus.REOPENED) {
            throw new BadRequestException("Job is not open for applications.");
        }
        
        // Validate candidate exists
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + candidateId));
        
        // Validate required custom questions are answered
        validateCustomQuestions(applicationDTO, job.getId());
        
        // Create and save the application
        Application application = new Application();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setResumeUrl(applicationDTO.getResumeUrl());
        application.setCoverLetterUrl(applicationDTO.getCoverLetterUrl());
        application.setPortfolioUrl(applicationDTO.getPortfolioUrl());
        application.setExperienceYears(applicationDTO.getExperienceYears());
        application.setCurrentCompany(applicationDTO.getCurrentCompany());
        application.setCurrentPosition(applicationDTO.getCurrentPosition());
        application.setExpectedSalary(applicationDTO.getExpectedSalary());
        application.setCreatedAt(ZonedDateTime.now());
        application.setUpdatedAt(ZonedDateTime.now());
        
        Application savedApplication = applicationRepository.save(application);
        
        // Save the application answers
        List<ApplicationAnswer> answers = new ArrayList<>();
        for (ApplicationAnswerDTO answerDTO : applicationDTO.getAnswers()) {
            ApplicationAnswer answer = new ApplicationAnswer();
            answer.setApplication(savedApplication);
            answer.setQuestionId(answerDTO.getQuestionId());
            answer.setAnswer(answerDTO.getAnswer());
            answer.setCreatedAt(ZonedDateTime.now());
            answers.add(answer);
        }
        
        if (!answers.isEmpty()) {
            applicationAnswerRepository.saveAll(answers);
            savedApplication.setAnswers(answers);
        }
        
        log.info("Application submitted successfully with ID: {}", savedApplication.getId());
        return mapToDTO(savedApplication);
    }

    @Override
    public ApplicationDTO getApplicationById(Long applicationId) {
        log.info("Getting application with ID: {}", applicationId);
        
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found with ID: " + applicationId));
        
        return mapToDTO(application);
    }

    @Override
    public Page<ApplicationDTO> getApplicationsByJobId(Long jobId, Pageable pageable) {
        log.info("Getting applications for job ID: {}", jobId);
        
        // Validate job exists
        if (!jobRepository.existsById(jobId)) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }
        
        Page<Application> applications = applicationRepository.findByJobId(jobId, pageable);
        return applications.map(this::mapToDTO);
    }

    @Override
    public Page<ApplicationDTO> getApplicationsByJobIdAndStatus(Long jobId, ApplicationStatus status, Pageable pageable) {
        log.info("Getting applications for job ID: {} with status: {}", jobId, status);
        
        // Validate job exists
        if (!jobRepository.existsById(jobId)) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }
        
        Page<Application> applications = applicationRepository.findByJobIdAndStatus(jobId, status, pageable);
        return applications.map(this::mapToDTO);
    }

    @Override
    public Page<ApplicationDTO> getApplicationsByCandidateId(Long candidateId, Pageable pageable) {
        log.info("Getting applications for candidate ID: {}", candidateId);
        
        // Validate candidate exists
        if (!userRepository.existsById(candidateId)) {
            throw new NotFoundException("User not found with ID: " + candidateId);
        }
        
        Page<Application> applications = applicationRepository.findByCandidateId(candidateId, pageable);
        return applications.map(this::mapToDTO);
    }

    @Override
    @Transactional
    public ApplicationDTO updateApplicationStatus(Long applicationId, ApplicationStatus newStatus) {
        log.info("Updating application status to {} for application ID: {}", newStatus, applicationId);
        
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found with ID: " + applicationId));
        
        application.setStatus(newStatus);
        application.setUpdatedAt(ZonedDateTime.now());
        
        Application updatedApplication = applicationRepository.save(application);
        log.info("Application status updated successfully for ID: {}", applicationId);
        
        return mapToDTO(updatedApplication);
    }

    @Override
    @Transactional
    public ApplicationDTO updateApplication(Long applicationId, ApplicationDTO applicationDTO) {
        log.info("Updating application with ID: {}", applicationId);
        
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found with ID: " + applicationId));
        
        // Only update certain fields
        application.setResumeUrl(applicationDTO.getResumeUrl());
        application.setCoverLetterUrl(applicationDTO.getCoverLetterUrl());
        application.setPortfolioUrl(applicationDTO.getPortfolioUrl());
        application.setExperienceYears(applicationDTO.getExperienceYears());
        application.setCurrentCompany(applicationDTO.getCurrentCompany());
        application.setCurrentPosition(applicationDTO.getCurrentPosition());
        application.setExpectedSalary(applicationDTO.getExpectedSalary());
        application.setUpdatedAt(ZonedDateTime.now());
        
        // Update the application answers if provided
        if (applicationDTO.getAnswers() != null && !applicationDTO.getAnswers().isEmpty()) {
            // Delete existing answers
            applicationAnswerRepository.deleteByApplicationId(applicationId);
            
            // Save new answers
            List<ApplicationAnswer> answers = new ArrayList<>();
            for (ApplicationAnswerDTO answerDTO : applicationDTO.getAnswers()) {
                ApplicationAnswer answer = new ApplicationAnswer();
                answer.setApplication(application);
                answer.setQuestionId(answerDTO.getQuestionId());
                answer.setAnswer(answerDTO.getAnswer());
                answer.setCreatedAt(ZonedDateTime.now());
                answers.add(answer);
            }
            
            if (!answers.isEmpty()) {
                applicationAnswerRepository.saveAll(answers);
                application.setAnswers(answers);
            }
        }
        
        Application updatedApplication = applicationRepository.save(application);
        log.info("Application updated successfully for ID: {}", applicationId);
        
        return mapToDTO(updatedApplication);
    }

    @Override
    @Transactional
    public boolean deleteApplication(Long applicationId) {
        log.info("Deleting application with ID: {}", applicationId);
        
        if (!applicationRepository.existsById(applicationId)) {
            throw new NotFoundException("Application not found with ID: " + applicationId);
        }
        
        // Delete application answers first
        applicationAnswerRepository.deleteByApplicationId(applicationId);
        
        // Delete the application
        applicationRepository.deleteById(applicationId);
        log.info("Application deleted successfully with ID: {}", applicationId);
        
        return true;
    }

    @Override
    public Map<ApplicationStatus, Long> getApplicationStatsByJobId(Long jobId) {
        log.info("Getting application statistics for job ID: {}", jobId);
        
        // Validate job exists
        if (!jobRepository.existsById(jobId)) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }
        
        List<Object[]> stats = applicationRepository.getApplicationStatsByJobId(jobId);
        Map<ApplicationStatus, Long> result = new HashMap<>();
        
        // Initialize all statuses with zero counts
        for (ApplicationStatus status : ApplicationStatus.values()) {
            result.put(status, 0L);
        }
        
        // Update with actual counts
        for (Object[] stat : stats) {
            ApplicationStatus status = (ApplicationStatus) stat[0];
            Long count = ((Number) stat[1]).longValue();
            result.put(status, count);
        }
        
        return result;
    }

    @Override
    public boolean hasApplied(Long jobId, Long candidateId) {
        log.debug("Checking if candidate ID: {} has applied to job ID: {}", candidateId, jobId);
        
        Optional<Application> application = applicationRepository.findByJobIdAndCandidateId(jobId, candidateId);
        return application.isPresent();
    }
    
    /**
     * Validate that all required custom questions have been answered
     * 
     * @param applicationDTO the application DTO
     * @param jobId the job ID
     */
    private void validateCustomQuestions(ApplicationDTO applicationDTO, Long jobId) {
        // Get all required questions for the job
        List<JobCustomQuestion> requiredQuestions = jobCustomQuestionRepository.findByJobIdAndIsRequired(jobId, true);
        
        if (requiredQuestions.isEmpty()) {
            return; // No required questions
        }
        
        // Get the question IDs that have been answered
        Set<Long> answeredQuestionIds = applicationDTO.getAnswers().stream()
                .map(ApplicationAnswerDTO::getQuestionId)
                .collect(Collectors.toSet());
        
        // Check if any required questions are missing
        List<String> missingQuestions = requiredQuestions.stream()
                .filter(q -> !answeredQuestionIds.contains(q.getId()))
                .map(JobCustomQuestion::getQuestionText)
                .collect(Collectors.toList());
        
        if (!missingQuestions.isEmpty()) {
            throw new BadRequestException("The following required questions are not answered: " + String.join(", ", missingQuestions));
        }
    }
    
    /**
     * Map an Application entity to an ApplicationDTO
     * 
     * @param application the application entity
     * @return the application DTO
     */
    private ApplicationDTO mapToDTO(Application application) {
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(application.getId());
        dto.setJobId(application.getJob().getId());
        dto.setCandidateId(application.getCandidate().getId());
        dto.setStatus(application.getStatus());
        dto.setResumeUrl(application.getResumeUrl());
        dto.setCoverLetterUrl(application.getCoverLetterUrl());
        dto.setPortfolioUrl(application.getPortfolioUrl());
        dto.setExperienceYears(application.getExperienceYears());
        dto.setCurrentCompany(application.getCurrentCompany());
        dto.setCurrentPosition(application.getCurrentPosition());
        dto.setExpectedSalary(application.getExpectedSalary());
        dto.setCreatedAt(application.getCreatedAt());
        dto.setUpdatedAt(application.getUpdatedAt());
        
        // Map application answers
        List<ApplicationAnswerDTO> answerDTOs = application.getAnswers().stream()
                .map(this::mapAnswerToDTO)
                .collect(Collectors.toList());
        dto.setAnswers(answerDTOs);
        
        return dto;
    }
    
    /**
     * Map an ApplicationAnswer entity to an ApplicationAnswerDTO
     * 
     * @param answer the application answer entity
     * @return the application answer DTO
     */
    private ApplicationAnswerDTO mapAnswerToDTO(ApplicationAnswer answer) {
        ApplicationAnswerDTO dto = new ApplicationAnswerDTO();
        dto.setId(answer.getId());
        dto.setApplicationId(answer.getApplication().getId());
        dto.setQuestionId(answer.getQuestionId());
        dto.setAnswer(answer.getAnswer());
        dto.setCreatedAt(answer.getCreatedAt());
        return dto;
    }
}

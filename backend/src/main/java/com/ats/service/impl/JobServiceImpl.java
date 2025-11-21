package com.ats.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ats.dto.JobCustomQuestionDTO;
import com.ats.dto.JobDTO;
import com.ats.exception.AtsCustomExceptions.NotFoundException;
import com.ats.model.Job;
import com.ats.model.User;
import com.ats.service.JobCustomQuestionService;
import com.ats.service.RegionalDataFilterService;
import com.ats.model.JobStatus;
import com.ats.model.WorkSetting;
import com.ats.repository.JobRepository;
import com.ats.service.JobService;
import com.ats.util.ModelMapperUtil;
import com.ats.util.IPUtils;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.ats.repository.UserRepository;
import com.ats.service.SubscriptionService;
import com.ats.service.EmailService;
import org.springframework.beans.factory.annotation.Value;

@Service
public class JobServiceImpl implements JobService {

    private static final Logger logger = LoggerFactory.getLogger(JobServiceImpl.class);

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private JobCustomQuestionService jobCustomQuestionService;
    
    @Autowired
    private RegionalDataFilterService regionalDataFilterService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapperUtil modelMapper;
    
    @Autowired
    private SubscriptionService subscriptionService;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    @Transactional
    public JobDTO createJob(JobDTO jobDTO) {
        Job job = modelMapper.map(jobDTO, Job.class);
        if (job.getJobStatus() == null){
            job.setJobStatus(JobStatus.DRAFT);
        }
        
        // Set the region based on the current user
        User currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getRegion() != null) {
            job.setRegion(currentUser.getRegion());
        }
        
        // Set posted date if the job is being published
        if (job.getJobStatus() == JobStatus.PUBLISHED || job.getJobStatus() == JobStatus.REOPENED) {
            job.setPostedDate(LocalDate.now());
        }
        
        // Set expiration date if provided
        if (jobDTO.getExpirationDate() != null) {
            job.setExpirationDate(jobDTO.getExpirationDate());
        }
        
        // Save the job first
        job = jobRepository.save(job);
        
        // Handle custom questions if provided
        if (jobDTO.getCustomQuestions() != null && !jobDTO.getCustomQuestions().isEmpty()) {
            logger.info("Processing {} custom questions for new job ID: {}", 
                       jobDTO.getCustomQuestions().size(), job.getId());
            
            for (JobCustomQuestionDTO questionDTO : jobDTO.getCustomQuestions()) {
                questionDTO.setJobId(job.getId());
                questionDTO.setId(null); // Ensure ID is null for new questions
                jobCustomQuestionService.createCustomQuestion(questionDTO);
            }
        }
        
        // Notify subscribers if job is published or reopened
        if (job.getJobStatus() == JobStatus.PUBLISHED || job.getJobStatus() == JobStatus.REOPENED) {
            notifySubscribers(job);
        }
        
        // Return the complete job with custom questions
        return getJobById(job.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public JobDTO getJobById(Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (!jobOpt.isPresent()) {
            throw new NotFoundException("Job not found with id: " + id);
        }
        
        Job job = jobOpt.get();
        JobDTO jobDTO = modelMapper.map(job, JobDTO.class);
        
        // Fetch and set custom questions
        List<JobCustomQuestionDTO> customQuestions = jobCustomQuestionService.getAllCustomQuestionsbyJobId(id);
        jobDTO.setCustomQuestions(customQuestions);
        
        return jobDTO;
    }

    @Override
    @Transactional
    public JobDTO updateJob(JobDTO jobDTO, Long id) {
        Optional<Job> existingJob = jobRepository.findById(id);
        
        if (existingJob.isPresent()) {
            Job updatedJob = existingJob.get();
            JobStatus oldStatus = updatedJob.getJobStatus();
            
            updatedJob.setTitle(jobDTO.getTitle());
            updatedJob.setDescription(jobDTO.getDescription());
            updatedJob.setLocation(jobDTO.getLocation());
            updatedJob.setDepartment(jobDTO.getDepartment());
            updatedJob.setSalaryRange(jobDTO.getSalaryRange());
            updatedJob.setEmploymentType(jobDTO.getEmploymentType());
            updatedJob.setSkills(jobDTO.getSkills());
            updatedJob.setWorkSetting(jobDTO.getWorkSetting());
            updatedJob.setJobStatus(jobDTO.getJobStatus());
            updatedJob.setExpirationDate(jobDTO.getExpirationDate());
            
            // Set posted date if job is being published for the first time or reopened
            if ((oldStatus != JobStatus.PUBLISHED && oldStatus != JobStatus.REOPENED) && 
                (jobDTO.getJobStatus() == JobStatus.PUBLISHED || jobDTO.getJobStatus() == JobStatus.REOPENED)) {
                updatedJob.setPostedDate(LocalDate.now());
            }
            
            // Save the job first
            Job savedJob = jobRepository.save(updatedJob);
            
            // Handle custom questions if provided
            if (jobDTO.getCustomQuestions() != null) {
                handleCustomQuestionsUpdate(id, jobDTO.getCustomQuestions());
            }
            
            // Notify subscribers if job status changed to published or reopened
            if ((oldStatus != JobStatus.PUBLISHED && oldStatus != JobStatus.REOPENED) && 
                (jobDTO.getJobStatus() == JobStatus.PUBLISHED || jobDTO.getJobStatus() == JobStatus.REOPENED)) {
                notifySubscribers(savedJob);
            }
            
            // Return the updated job with custom questions
            return getJobById(id);
        } else {
            throw new NotFoundException("Job not found with id: " + id);
        }
    }
    
    /**
     * Handle updating custom questions for a job
     * This method will create new questions and delete removed ones
     */
    private void handleCustomQuestionsUpdate(Long jobId, List<JobCustomQuestionDTO> newQuestions) {
        // Get existing questions
        List<JobCustomQuestionDTO> existingQuestions = jobCustomQuestionService.getAllCustomQuestionsbyJobId(jobId);
        
        // Create a map of existing questions by ID for quick lookup
        Map<Long, JobCustomQuestionDTO> existingQuestionsMap = existingQuestions.stream()
                .collect(Collectors.toMap(JobCustomQuestionDTO::getId, q -> q));
        
        // Track which existing questions are still present
        Set<Long> keptQuestionIds = new HashSet<>();
        
        // Process new questions
        for (JobCustomQuestionDTO newQuestion : newQuestions) {
            if (newQuestion.getId() != null && existingQuestionsMap.containsKey(newQuestion.getId())) {
                // Keep existing question (no update functionality)
                keptQuestionIds.add(newQuestion.getId());
            } else {
                // Create new question
                newQuestion.setJobId(jobId);
                newQuestion.setId(null); // Ensure ID is null for new questions
                jobCustomQuestionService.createCustomQuestion(newQuestion);
            }
        }
        
        // Delete questions that are no longer present
        for (JobCustomQuestionDTO existingQuestion : existingQuestions) {
            if (!keptQuestionIds.contains(existingQuestion.getId())) {
                try {
                    jobCustomQuestionService.deleteCustomQuestionById(existingQuestion.getId());
                } catch (IllegalStateException e) {
                    // Question has answers, cannot be deleted - log warning but continue
                    logger.warn("Cannot delete custom question with ID: {} - {}", existingQuestion.getId(), e.getMessage());
                }
            }
        }
    }

    @Override
    public boolean deleteJob(Long id) {
        Optional<Job> job = jobRepository.findById(id);
        if (job.isPresent()) {
            jobRepository.delete(job.get());
            return true;
        }
        return false;
    }

    @Override
    public List<JobDTO> getAllJobs(
        List<JobStatus> jobStatuses, 
        List<WorkSetting> workSettings, 
        String description
    ) {
        // Check if request is from ist.com subdomain
        boolean isISTSubdomain = IPUtils.isISTSubdomain();
        if (isISTSubdomain) {
            logger.info("🌍 Request from ist.com subdomain detected - filtering to show only EU jobs");
        }
        
        // Get current user for regional filtering
        User currentUser = getCurrentUser();
        
        // Create dynamic query using Specifications
        Specification<Job> spec = Specification.where(null);

        // Add regional filtering based on subdomain or current user
        if (isISTSubdomain) {
            // If accessed from ist.com subdomain, only show EU jobs
            spec = spec.and((root, query, cb) -> cb.equal(root.get("region"), "EU"));
            logger.info("✅ Applied EU region filter for ist.com subdomain");
        } else if (currentUser != null) {
            if (regionalDataFilterService.isEUAdmin(currentUser)) {
                // EU admins can only see EU jobs
                spec = spec.and((root, query, cb) -> cb.equal(root.get("region"), "EU"));
            } else if (regionalDataFilterService.isNonEUAdmin(currentUser)) {
                // Non-EU admins can only see non-EU jobs
                spec = spec.and((root, query, cb) -> cb.or(
                    cb.isNull(root.get("region")),
                    cb.notEqual(root.get("region"), "EU")
                ));
            }
        }

        // Add filters only if parameters are provided
        if (jobStatuses != null && !jobStatuses.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("jobStatus").in(jobStatuses));
        }

        if (workSettings != null && !workSettings.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("workSetting").in(workSettings));
        }

        if (description != null && !description.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), "%" + description.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%")
            ));
        }

        // Execute query and map to DTOs
        return jobRepository.findAll(spec)
                .stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }
    @Override
    public List<JobDTO> getActiveJobs() {
        // Check if request is from ist.com subdomain
        boolean isISTSubdomain = IPUtils.isISTSubdomain();
        if (isISTSubdomain) {
            logger.info("🌍 Request from ist.com subdomain detected in getActiveJobs - filtering to show only EU jobs");
        }
        
        // Get current user for regional filtering
        User currentUser = getCurrentUser();
        
        List<Job> jobs = jobRepository.findByJobStatusIn(List.of(JobStatus.PUBLISHED, JobStatus.REOPENED));
        
        // Apply regional filtering
        if (isISTSubdomain) {
            // If accessed from ist.com subdomain, only show EU jobs
            jobs = jobs.stream()
                .filter(job -> "EU".equals(job.getRegion()))
                .collect(Collectors.toList());
            logger.info("✅ Applied EU region filter for ist.com subdomain in getActiveJobs");
        } else if (currentUser != null) {
            jobs = jobs.stream()
                .filter(job -> {
                    String jobRegion = job.getRegion();
                    
                    // EU admins can only see EU jobs
                    if (regionalDataFilterService.isEUAdmin(currentUser)) {
                        return "EU".equals(jobRegion);
                    }
                    
                    // Non-EU admins can only see non-EU jobs
                    if (regionalDataFilterService.isNonEUAdmin(currentUser)) {
                        return !"EU".equals(jobRegion);
                    }
                    
                    return true; // Fallback
                })
                .collect(Collectors.toList());
        }
        
        return jobs.stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<JobDTO> getPastJobs() {
        // Check if request is from ist.com subdomain
        boolean isISTSubdomain = IPUtils.isISTSubdomain();
        
        // Get current user for regional filtering
        User currentUser = getCurrentUser();
        
        List<Job> jobs = jobRepository.findByJobStatusIn(List.of(JobStatus.EXPIRED, JobStatus.CLOSED));
        
        // Apply regional filtering
        if (isISTSubdomain) {
            // If accessed from ist.com subdomain, only show EU jobs
            jobs = jobs.stream()
                .filter(job -> "EU".equals(job.getRegion()))
                .collect(Collectors.toList());
        } else if (currentUser != null) {
            jobs = jobs.stream()
                .filter(job -> {
                    String jobRegion = job.getRegion();
                    
                    // EU admins can only see EU jobs
                    if (regionalDataFilterService.isEUAdmin(currentUser)) {
                        return "EU".equals(jobRegion);
                    }
                    
                    // Non-EU admins can only see non-EU jobs
                    if (regionalDataFilterService.isNonEUAdmin(currentUser)) {
                        return !"EU".equals(jobRegion);
                    }
                    
                    return true; // Fallback
                })
                .collect(Collectors.toList());
        }
        
        return jobs.stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }
    @Override
    public List<JobDTO> searchJobs(String keyword, String filter) {
        // Check if request is from ist.com subdomain
        boolean isISTSubdomain = IPUtils.isISTSubdomain();
        
        // Get current user for regional filtering
        User currentUser = getCurrentUser();
        
        List<Job> jobs = jobRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            keyword, keyword);
        
        // Apply regional filtering
        if (isISTSubdomain) {
            // If accessed from ist.com subdomain, only show EU jobs
            jobs = jobs.stream()
                .filter(job -> "EU".equals(job.getRegion()))
                .collect(Collectors.toList());
        } else if (currentUser != null) {
            jobs = jobs.stream()
                .filter(job -> {
                    String jobRegion = job.getRegion();
                    
                    // EU admins can only see EU jobs
                    if (regionalDataFilterService.isEUAdmin(currentUser)) {
                        return "EU".equals(jobRegion);
                    }
                    
                    // Non-EU admins can only see non-EU jobs
                    if (regionalDataFilterService.isNonEUAdmin(currentUser)) {
                        return !"EU".equals(jobRegion);
                    }
                    
                    return true; // Fallback
                })
                .collect(Collectors.toList());
        }
        
        return jobs.stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public JobDTO updateJobStatus(JobStatus jobStatus, Long id) {
        Optional<Job> existingJob = jobRepository.findById(id);
        
        if (existingJob.isPresent()) {
            Job updatedJob = existingJob.get();
            JobStatus oldStatus = updatedJob.getJobStatus();
            
            updatedJob.setJobStatus(jobStatus);
            
            // Set posted date if job is being published for the first time or reopened
            if ((oldStatus != JobStatus.PUBLISHED && oldStatus != JobStatus.REOPENED) && 
                (jobStatus == JobStatus.PUBLISHED || jobStatus == JobStatus.REOPENED)) {
                updatedJob.setPostedDate(LocalDate.now());
            }
            
            Job savedJob = jobRepository.save(updatedJob);
            
            // Notify subscribers if job status changed to published or reopened
            if ((oldStatus != JobStatus.PUBLISHED && oldStatus != JobStatus.REOPENED) && 
                (jobStatus == JobStatus.PUBLISHED || jobStatus == JobStatus.REOPENED)) {
                notifySubscribers(savedJob);
            }
            
            return modelMapper.map(savedJob, JobDTO.class);
        } else {
            throw new NotFoundException("Job not found with id: " + id);
        }
    }
    
    /**
     * Get the current authenticated user
     */
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }
            
            String email = authentication.getName();
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            logger.error("Error getting current user", e);
            return null;
        }
    }
    
    /**
     * Notify all subscribed users about a new job posting
     */
    private void notifySubscribers(Job job) {
        try {
            List<User> subscribedUsers = subscriptionService.getAllSubscribedUsers();
            logger.info("Notifying {} subscribed users about job: {}", subscribedUsers.size(), job.getTitle());
            
            for (User user : subscribedUsers) {
                // Check if user wants job notifications
                try {
                    Map<String, Boolean> preferences = subscriptionService.getSubscriptionPreferences(user.getId());
                    if (!preferences.getOrDefault("jobNotifications", true)) {
                        continue; // Skip if user has disabled job notifications
                    }
                } catch (Exception e) {
                    logger.warn("Error reading preferences for user {}: {}", user.getId(), e.getMessage());
                    // Continue with default behavior (send notification)
                }
                
                try {
                    // Create email content
                    String subject = "New Job Posted: " + job.getTitle();
                    String content = buildJobNotificationEmail(job, user);
                    
                    // Send email notification
                    emailService.sendCustomEmail(
                        user.getEmail(),
                        subject,
                        content,
                        true,
                        null // No sender user for automated notifications
                    );
                } catch (Exception e) {
                    logger.error("Error sending job notification to user {}: {}", user.getEmail(), e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error notifying subscribers about job {}: {}", job.getId(), e.getMessage());
        }
    }
    
    /**
     * Build HTML email content for job notification
     */
    private String buildJobNotificationEmail(Job job, User user) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body style='font-family: Arial, sans-serif; padding: 20px;'>");
        html.append("<h2 style='color: #4f46e5;'>New Job Opportunity</h2>");
        html.append("<p>Hello ").append(user.getFirstName()).append(",</p>");
        html.append("<p>We have a new job posting that might interest you:</p>");
        html.append("<div style='background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;'>");
        html.append("<h3 style='margin-top: 0;'>").append(job.getTitle()).append("</h3>");
        if (job.getDepartment() != null) {
            html.append("<p><strong>Department:</strong> ").append(job.getDepartment()).append("</p>");
        }
        if (job.getLocation() != null) {
            html.append("<p><strong>Location:</strong> ").append(job.getLocation()).append("</p>");
        }
        if (job.getWorkSetting() != null) {
            html.append("<p><strong>Work Setting:</strong> ").append(job.getWorkSetting()).append("</p>");
        }
        if (job.getDescription() != null && !job.getDescription().isEmpty()) {
            html.append("<p><strong>Description:</strong></p>");
            html.append("<p>").append(job.getDescription().substring(0, Math.min(200, job.getDescription().length()))).append("...</p>");
        }
        html.append("</div>");
        html.append("<p><a href='").append(frontendUrl).append("/jobs/").append(job.getId()).append("' style='background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>View Job Details</a></p>");
        html.append("<p style='color: #6b7280; font-size: 12px; margin-top: 30px;'>You're receiving this because you subscribed to job notifications. <a href='").append(frontendUrl).append("/unsubscribe'>Unsubscribe</a></p>");
        html.append("</body></html>");
        return html.toString();
    }
}

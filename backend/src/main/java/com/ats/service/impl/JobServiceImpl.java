package com.ats.service.impl;

import org.hibernate.annotations.NotFoundAction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ats.dto.JobCustomQuestionDTO;
import com.ats.dto.JobDTO;
import com.ats.exception.AtsCustomExceptions.NotFoundException;
import com.ats.model.Job;
import com.ats.service.JobCustomQuestionService;
import com.ats.model.JobStatus;
import com.ats.model.WorkSetting;
import com.ats.repository.JobRepository;
import com.ats.service.JobService;
import com.ats.util.ModelMapperUtil;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class JobServiceImpl implements JobService {

    private static final Logger logger = LoggerFactory.getLogger(JobServiceImpl.class);

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private JobCustomQuestionService jobCustomQuestionService;

    @Autowired
    private ModelMapperUtil modelMapper;

    @Override
    public JobDTO createJob(JobDTO jobDTO) {
        Job job = modelMapper.map(jobDTO, Job.class);
        if (job.getJobStatus() == null){
            job.setJobStatus(JobStatus.DRAFT);
        }
        
        job = jobRepository.save(job);
        return modelMapper.map(job, JobDTO.class);
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
            updatedJob.setTitle(jobDTO.getTitle());
            updatedJob.setDescription(jobDTO.getDescription());
            updatedJob.setLocation(jobDTO.getLocation());
            updatedJob.setDepartment(jobDTO.getDepartment());
            updatedJob.setSalaryRange(jobDTO.getSalaryRange());
            updatedJob.setEmploymentType(jobDTO.getEmploymentType());
            updatedJob.setSkills(jobDTO.getSkills());
            updatedJob.setWorkSetting(jobDTO.getWorkSetting());
            updatedJob.setJobStatus(jobDTO.getJobStatus());
            
            // Save the job first
            Job savedJob = jobRepository.save(updatedJob);
            
            // Handle custom questions if provided
            if (jobDTO.getCustomQuestions() != null) {
                handleCustomQuestionsUpdate(id, jobDTO.getCustomQuestions());
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
        // Create dynamic query using Specifications
        Specification<Job> spec = Specification.where(null);

        // Add filters only if parameters are provided
        if (jobStatuses != null && !jobStatuses.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("jobStatus").in(jobStatuses));
        }

        if (workSettings != null && !workSettings.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("workSetting").in(workSettings));
        }

        if (description != null && !description.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%"));
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
        return jobRepository.findByJobStatusIn(List.of(JobStatus.PUBLISHED, JobStatus.REOPENED))
                .stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<JobDTO> getPastJobs() {
        return jobRepository.findByJobStatusIn(List.of(JobStatus.EXPIRED, JobStatus.CLOSED))
                .stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }
    @Override
    public List<JobDTO> searchJobs(String keyword, String filter) {
        return jobRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            keyword, keyword)
                .stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public JobDTO updateJobStatus(JobStatus jobStatus, Long id) {

        Optional<Job> existingJob = jobRepository.findById(id);
        
        if (existingJob.isPresent()) {
            Job updatedJob = existingJob.get();
            updatedJob.setJobStatus(jobStatus);
            Job savedJob = jobRepository.save(updatedJob);
            return modelMapper.map(savedJob, JobDTO.class);
        } else {
            throw new NotFoundException("Job not found with id: " + id);
        }
    }
}

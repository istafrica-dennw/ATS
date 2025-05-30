package com.ats.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ats.dto.JobCustomQuestionDTO;
import com.ats.model.Job;
import com.ats.model.JobCustomQuestion;
import com.ats.repository.JobCustomQuestionRepository;
import com.ats.repository.JobRepository;
import com.ats.service.JobCustomQuestionService;
import com.ats.exception.ResourceNotFoundException;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class JobCustomQuestionServiceImpl implements JobCustomQuestionService {

    private static final Logger logger = LoggerFactory.getLogger(JobCustomQuestionServiceImpl.class);
    
    private final JobCustomQuestionRepository jobCustomQuestionRepository;
    private final JobRepository jobRepository;
    private final ModelMapper modelMapper;
    
    public JobCustomQuestionServiceImpl(
            JobCustomQuestionRepository jobCustomQuestionRepository,
            JobRepository jobRepository,
            ModelMapper modelMapper) {
        this.jobCustomQuestionRepository = jobCustomQuestionRepository;
        this.jobRepository = jobRepository;
        this.modelMapper = modelMapper;
    }
    
    @Override
    @Transactional
    public JobCustomQuestionDTO createCustomQuestion(JobCustomQuestionDTO customQuestionDTO) {
        logger.info("Creating custom question for job ID: {}", customQuestionDTO.getJobId());
        
        // Find the job
        Job job = jobRepository.findById(customQuestionDTO.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + customQuestionDTO.getJobId()));
        
        // Create and save the custom question
        JobCustomQuestion customQuestion = new JobCustomQuestion();
        customQuestion.setJob(job);
        customQuestion.setQuestionText(customQuestionDTO.getQuestionText());
        customQuestion.setQuestionType(customQuestionDTO.getQuestionType());
        customQuestion.setOptions(customQuestionDTO.getOptions()); // Set the options field
        customQuestion.setIsRequired(customQuestionDTO.getRequired());
        customQuestion.setIsVisible(true); // Default to visible
        
        JobCustomQuestion savedQuestion = jobCustomQuestionRepository.save(customQuestion);
        
        return mapToDTO(savedQuestion);
    }

    @Override
    @Transactional
    public boolean deleteCustomQuestionById(Long customQuestionId) {
        logger.info("Deleting custom question with ID: {}", customQuestionId);
        
        if (!jobCustomQuestionRepository.existsById(customQuestionId)) {
            logger.warn("Custom question not found with ID: {}", customQuestionId);
            return false;
        }
        
        jobCustomQuestionRepository.deleteById(customQuestionId);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobCustomQuestionDTO> getAllCustomQuestionsbyJobId(Long jobId) {
        logger.info("Getting all custom questions for job ID: {}", jobId);
        
        // Verify job exists
        if (!jobRepository.existsById(jobId)) {
            throw new ResourceNotFoundException("Job not found with id: " + jobId);
        }
        
        List<JobCustomQuestion> questions = jobCustomQuestionRepository.findByJobId(jobId);
        
        return questions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobCustomQuestionDTO getCustomQuestionbyId(Long customQuestionId) {
        logger.info("Getting custom question with ID: {}", customQuestionId);
        
        JobCustomQuestion question = jobCustomQuestionRepository.findById(customQuestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Custom question not found with id: " + customQuestionId));
        
        return mapToDTO(question);
    }

    @Override
    @Transactional
    public JobCustomQuestionDTO associateQuestionWithJob(Long customQuestionId, Long jobId) {
        logger.info("Associating custom question ID: {} with job ID: {}", customQuestionId, jobId);
        
        // Find the job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        
        // Find the custom question
        JobCustomQuestion question = jobCustomQuestionRepository.findById(customQuestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Custom question not found with id: " + customQuestionId));
        
        // Update the association
        question.setJob(job);
        JobCustomQuestion updatedQuestion = jobCustomQuestionRepository.save(question);
        
        return mapToDTO(updatedQuestion);
    }
    
    @Override
    @Transactional
    public boolean disassociateQuestionFromJob(Long customQuestionId, Long jobId) {
        logger.info("Disassociating custom question ID: {} from job ID: {}", customQuestionId, jobId);
        
        // Check if the question exists and is associated with the job
        if (!jobCustomQuestionRepository.existsByJobIdAndId(jobId, customQuestionId)) {
            logger.warn("Custom question ID: {} is not associated with job ID: {}", customQuestionId, jobId);
            return false;
        }
        
        // Instead of removing the association, we'll delete the question
        // This is because in our current model, a question must be associated with a job
        jobCustomQuestionRepository.deleteById(customQuestionId);
        
        return true;
    }
    
    /**
     * Maps a JobCustomQuestion entity to a JobCustomQuestionDTO
     * 
     * @param question The entity to map
     * @return The mapped DTO
     */
    private JobCustomQuestionDTO mapToDTO(JobCustomQuestion question) {
        JobCustomQuestionDTO dto = modelMapper.map(question, JobCustomQuestionDTO.class);
        
        // Handle specific mapping needs
        dto.setJobId(question.getJob().getId());
        dto.setRequired(question.getIsRequired());
        dto.setActive(question.getIsVisible());
        
        return dto;
    }
}

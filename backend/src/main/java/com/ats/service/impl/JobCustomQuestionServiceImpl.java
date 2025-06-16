package com.ats.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ats.dto.JobCustomQuestionDTO;
import com.ats.model.Job;
import com.ats.model.JobCustomQuestion;
import com.ats.repository.ApplicationAnswerRepository;
import com.ats.repository.JobCustomQuestionRepository;
import com.ats.repository.JobRepository;
import com.ats.service.JobCustomQuestionService;
import com.ats.exception.AtsCustomExceptions.NotFoundException;
import com.ats.util.ModelMapperUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class JobCustomQuestionServiceImpl implements JobCustomQuestionService {

    private static final Logger logger = LoggerFactory.getLogger(JobCustomQuestionServiceImpl.class);
    
    @Autowired
    private JobCustomQuestionRepository jobCustomQuestionRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationAnswerRepository applicationAnswerRepository;

    @Autowired
    private ModelMapperUtil modelMapper;
    
    @Override
    @Transactional
    public JobCustomQuestionDTO createCustomQuestion(JobCustomQuestionDTO customQuestionDTO) {
        logger.info("Creating custom question for job ID: {}", customQuestionDTO.getJobId());
        
        // Find the job
        Job job = jobRepository.findById(customQuestionDTO.getJobId())
                .orElseThrow(() -> new NotFoundException("Job not found with id: " + customQuestionDTO.getJobId()));
        
        // Create and save the custom question
        JobCustomQuestion customQuestion = new JobCustomQuestion();
        customQuestion.setJob(job);
        customQuestion.setQuestionText(customQuestionDTO.getQuestionText());
        customQuestion.setQuestionType(customQuestionDTO.getQuestionType());
        customQuestion.setOptions(customQuestionDTO.getOptions());
        customQuestion.setIsRequired(customQuestionDTO.getRequired());
        customQuestion.setIsVisible(true);
        
        JobCustomQuestion savedQuestion = jobCustomQuestionRepository.save(customQuestion);
        logger.info("Successfully created custom question with ID: {}", savedQuestion.getId());
        
        return modelMapper.map(savedQuestion, JobCustomQuestionDTO.class);
    }

    @Override
    @Transactional
    public boolean deleteCustomQuestionById(Long customQuestionId) {
        logger.info("Attempting to delete custom question with ID: {}", customQuestionId);
        
        // Check if the question exists
        Optional<JobCustomQuestion> questionOpt = jobCustomQuestionRepository.findById(customQuestionId);
        if (!questionOpt.isPresent()) {
            logger.warn("Custom question with ID: {} not found", customQuestionId);
            return false;
        }
        
        JobCustomQuestion question = questionOpt.get();
        
        // Check if the question has any answers
        long answerCount = applicationAnswerRepository.countByQuestionId(customQuestionId);
        if (answerCount > 0) {
            logger.warn("Cannot delete custom question with ID: {} - it has {} answers from applicants", customQuestionId, answerCount);
            throw new IllegalStateException("Cannot delete question: it has already been answered by applicants");
        }
        
        // Safe to delete
        jobCustomQuestionRepository.deleteById(customQuestionId);
        logger.info("Successfully deleted custom question with ID: {}", customQuestionId);
        return true;
    }

    @Override
    public List<JobCustomQuestionDTO> getAllCustomQuestionsbyJobId(Long jobId) {
        logger.info("Fetching all custom questions for job ID: {}", jobId);
        
        // Validate job exists
        if (!jobRepository.existsById(jobId)) {
            throw new NotFoundException("Job not found with id: " + jobId);
        }
        
        List<JobCustomQuestion> questions = jobCustomQuestionRepository.findByJobId(jobId);
        logger.info("Found {} custom questions for job ID: {}", questions.size(), jobId);
        
        return questions.stream()
                .map(question -> modelMapper.map(question, JobCustomQuestionDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public JobCustomQuestionDTO getCustomQuestionbyId(Long customQuestionId) {
        logger.info("Fetching custom question with ID: {}", customQuestionId);
        
        JobCustomQuestion question = jobCustomQuestionRepository.findById(customQuestionId)
                .orElseThrow(() -> new NotFoundException("Custom question not found with id: " + customQuestionId));
        
        logger.info("Successfully fetched custom question with ID: {}", customQuestionId);
        return modelMapper.map(question, JobCustomQuestionDTO.class);
    }

    @Override
    @Transactional
    public JobCustomQuestionDTO associateQuestionWithJob(Long customQuestionId, Long jobId) {
        logger.info("Associating custom question ID: {} with job ID: {}", customQuestionId, jobId);
        
        // Find the job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found with id: " + jobId));
        
        // Find the custom question
        JobCustomQuestion question = jobCustomQuestionRepository.findById(customQuestionId)
                .orElseThrow(() -> new NotFoundException("Custom question not found with id: " + customQuestionId));
        
        // Update the association
        question.setJob(job);
        JobCustomQuestion updatedQuestion = jobCustomQuestionRepository.save(question);
        
        return modelMapper.map(updatedQuestion, JobCustomQuestionDTO.class);
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
}

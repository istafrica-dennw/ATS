package com.ats.service;

import java.util.List;

import org.springframework.stereotype.Service;
import com.ats.dto.*;


@Service
public interface JobCustomQuestionService {

    public JobCustomQuestionDTO createCustomQuestion(JobCustomQuestionDTO customQuestion);
    public boolean deleteCustomQuestionById(Long customQuestionId);
    public List<JobCustomQuestionDTO> getAllCustomQuestionsbyJobId(Long JobId);
    public JobCustomQuestionDTO getCustomQuestionbyId(Long customQuestionId);
    
    /**
     * Associates a custom question with a specific job.
     * This method explicitly creates or updates the relationship between a question and a job.
     * 
     * @param customQuestionId The ID of the custom question to associate
     * @param jobId The ID of the job to associate the question with
     * @return The updated custom question DTO after association
     */
    public JobCustomQuestionDTO associateQuestionWithJob(Long customQuestionId, Long jobId);
    
    /**
     * Disassociates a custom question from a specific job.
     * This method removes the relationship between a question and a job without deleting the question.
     * 
     * @param customQuestionId The ID of the custom question to disassociate
     * @param jobId The ID of the job to disassociate the question from
     * @return true if disassociation was successful, false otherwise
     */
    public boolean disassociateQuestionFromJob(Long customQuestionId, Long jobId);

}

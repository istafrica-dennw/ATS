package com.ats.controller.jobs;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.ats.dto.JobCustomQuestionDTO;
import com.ats.exception.AtsCustomExceptions.NotFoundException;
import com.ats.service.JobCustomQuestionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@Tag(name="Job Custom Questions", description="APIs for managing custom questions for jobs")
public class JobCustomQuestionController extends BaseJobController {

    private static final Logger logger = LoggerFactory.getLogger(JobCustomQuestionController.class);

    private final JobCustomQuestionService jobCustomQuestionService;
    
    public JobCustomQuestionController(JobCustomQuestionService jobCustomQuestionService) {
        this.jobCustomQuestionService = jobCustomQuestionService;
    }
    
    @Operation(summary = "Get all custom questions for a job",
              description = "Retrieves all custom questions associated with the specified job")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved list of custom questions",
                     content = @Content(schema = @Schema(implementation = JobCustomQuestionDTO.class))),
        @ApiResponse(responseCode = "404", description = "Job not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{jobId}/custom-questions")
    public ResponseEntity<List<JobCustomQuestionDTO>> getAllCustomQuestionsByJobId(@PathVariable Long jobId) {
        logger.info("Fetching all custom questions for job ID: {}", jobId);
        
        try {
            List<JobCustomQuestionDTO> questions = jobCustomQuestionService.getAllCustomQuestionsbyJobId(jobId);
            logger.info("Found {} custom questions for job ID: {}", questions.size(), jobId);
            return ResponseEntity.ok(questions);
            
        } catch (NotFoundException e) {
            logger.warn("Job not found: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
            
        } catch (Exception e) {
            logger.error("Error retrieving custom questions for job ID: {}", jobId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "An error occurred while retrieving custom questions", e);
        }
    }
    
    @Operation(summary = "Create a new custom question for a job", 
              description = "Creates a new custom question associated with the specified job")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Custom question created successfully",
                     content = @Content(schema = @Schema(implementation = JobCustomQuestionDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Job not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/{jobId}/job-custom-questions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JobCustomQuestionDTO> createCustomQuestion(
            @PathVariable Long jobId,
            @Valid @RequestBody JobCustomQuestionDTO customQuestionDTO) {
        
        logger.info("Creating new custom question for job ID: {}", jobId);
        logger.debug("Request data before creation: {}", customQuestionDTO);
        
        // Set the job ID from the path parameter
        customQuestionDTO.setJobId(jobId);
        JobCustomQuestionDTO createdQuestion = jobCustomQuestionService.createCustomQuestion(customQuestionDTO);
        
        logger.info("Successfully created custom question with ID: {}", createdQuestion.getId());
        logger.debug("Created question data: {}", createdQuestion);
        return new ResponseEntity<>(createdQuestion, HttpStatus.CREATED);
    }
    
    @Operation(summary = "Delete a custom question", 
              description = "Deletes a custom question by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Question deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Question not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @DeleteMapping("/custom-questions/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCustomQuestion(@PathVariable Long questionId) {
        logger.info("Deleting custom question with ID: {}", questionId);
        
        try {
            boolean isDeleted = jobCustomQuestionService.deleteCustomQuestionById(questionId);
            
            if (!isDeleted) {
                logger.warn("Custom question with ID: {} not found", questionId);
                throw new NotFoundException( String.format("Custom question with ID %d not found", questionId));
            }
            
            logger.info("Successfully deleted custom question with ID: {}", questionId);
            return ResponseEntity.noContent().build();
            
        } catch (NotFoundException e) {
            logger.warn("Custom question with ID: {} not found", questionId);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (IllegalStateException e) {
            // Question has answers, cannot be deleted
            logger.warn("Cannot delete custom question with ID: {} - {}", questionId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            logger.error("Error deleting custom question with ID: {}", questionId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while deleting the custom question", e);
        }
    }
}

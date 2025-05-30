package com.ats.model;

/**
 * Enum representing different types of custom questions that can be associated with a job.
 */
public enum QuestionType {
    /**
     * Free-form text response
     */
    TEXT,
    
    /**
     * Multiple choice question with predefined options
     */
    MULTIPLE_CHOICE,
    
    /**
     * Yes/No question
     */
    YES_NO,
    
    /**
     * Rating scale question (e.g., 1-5, 1-10)
     */
    RATING,
    
    /**
     * File upload question (e.g., for portfolio samples)
     */
    FILE_UPLOAD,
    
    /**
     * Date selection question
     */
    DATE
}

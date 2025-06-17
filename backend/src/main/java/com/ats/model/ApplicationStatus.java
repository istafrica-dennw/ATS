package com.ats.model;

/**
 * Represents the possible statuses of a job application.
 */
public enum ApplicationStatus {
    /**
     * Application has been submitted by candidate
     */
    APPLIED,
    
    /**
     * Application has been viewed by a recruiter
     */
    REVIEWED,
    
    /**
     * Application has been shortlisted for interview
     */
    SHORTLISTED,
    
    /**
     * Candidate is currently in interview process
     */
    INTERVIEWING,
    
    /**
     * Candidate has been offered the position
     */
    OFFERED,
    
    /**
     * Candidate has accepted the offer
     */
    ACCEPTED,
    
    /**
     * Application has been rejected
     */
    REJECTED,
    
    /**
     * Candidate has withdrawn their application
     */
    WITHDRAWN,
    
    /**
     * Candidate has accepted the offer
     */
    OFFER_ACCEPTED,
    
    /**
     * Candidate has rejected the offer
     */
    OFFER_REJECTED
}

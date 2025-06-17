package com.ats.model;

/**
 * Email event types for different system actions
 */
public enum EmailEvent {
    APPLICATION_RECEIVED("application-received"),
    APPLICATION_REVIEWED("application-reviewed"),
    APPLICATION_SHORTLISTED("application-shortlisted"),
    INTERVIEW_ASSIGNED_TO_INTERVIEWER("interview-assigned-interviewer"),
    INTERVIEW_ASSIGNED_TO_CANDIDATE("interview-assigned-candidate"),
    USER_VERIFICATION("verification-email"),
    PASSWORD_RESET("password-reset-email"),
    NEW_USER_CREATED("new-user-email"),
    JOB_OFFER("job-offer");

    private final String templateName;

    EmailEvent(String templateName) {
        this.templateName = templateName;
    }

    public String getTemplateName() {
        return templateName;
    }
}

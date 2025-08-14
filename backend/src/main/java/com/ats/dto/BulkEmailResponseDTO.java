package com.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkEmailResponseDTO {
    
    /**
     * Total number of emails attempted to be sent
     */
    private Integer totalAttempted;
    
    /**
     * Number of emails successfully sent
     */
    private Integer successCount;
    
    /**
     * Number of emails that failed to send
     */
    private Integer failureCount;
    
    /**
     * List of email notification IDs created
     */
    private List<Long> emailNotificationIds;
    
    /**
     * List of failed email details
     */
    private List<FailedEmailDetail> failures;
    
    /**
     * When the bulk email operation was started
     */
    private ZonedDateTime startedAt;
    
    /**
     * When the bulk email operation was completed
     */
    private ZonedDateTime completedAt;
    
    /**
     * Overall status of the bulk email operation
     */
    private String status; // SUCCESS, PARTIAL_SUCCESS, FAILED
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailedEmailDetail {
        private Long applicationId;
        private String candidateEmail;
        private String candidateName;
        private String errorMessage;
    }
}
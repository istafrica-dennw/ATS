package com.ats.dto;

import com.ats.model.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkEmailRequestDTO {
    
    /**
     * Job ID to filter applicants. If null, all jobs are considered.
     */
    private Long jobId;
    
    /**
     * Application status to filter applicants by. If null, all statuses are considered.
     */
    private ApplicationStatus status;
    
    /**
     * List of specific application IDs to send emails to.
     * If provided, jobId and status filters are ignored.
     */
    private List<Long> applicationIds;
    
    /**
     * Email subject line
     */
    @NotBlank(message = "Subject is required")
    @Size(max = 255, message = "Subject must not exceed 255 characters")
    private String subject;
    
    /**
     * Email content/body
     */
    @NotBlank(message = "Email content is required")
    @Size(max = 10000, message = "Email content must not exceed 10,000 characters")
    private String content;
    
    /**
     * Whether to use HTML content
     */
    @Builder.Default
    private Boolean isHtml = false;
    
    /**
     * Whether to send a test email first
     */
    @Builder.Default
    private Boolean sendTest = false;
    
    /**
     * Test email recipient (admin email)
     */
    private String testEmailRecipient;
    
    /**
     * Whether to send to subscribed users instead of applicants
     */
    @Builder.Default
    private Boolean sendToSubscribedUsers = false;
}
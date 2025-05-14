package com.ats.dto;

import com.ats.model.EmailNotification.EmailStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Email Notification Data Transfer Object")
public class EmailNotificationDTO {
    
    @Schema(description = "Email notification ID", example = "1")
    private Long id;
    
    @Schema(description = "Recipient email address", example = "john.doe@example.com")
    private String recipientEmail;
    
    @Schema(description = "Email subject", example = "Welcome to ATS System - Verify Your Email")
    private String subject;
    
    @Schema(description = "Email body content in HTML format")
    private String body;
    
    @Schema(description = "Template name used for the email", example = "verification-email")
    private String templateName;
    
    @Schema(description = "Current status of the email", example = "SENT", 
            allowableValues = {"PENDING", "SENT", "FAILED"})
    private EmailStatus status;
    
    @Schema(description = "Error message if the email failed to send")
    private String errorMessage;
    
    @Schema(description = "Number of retry attempts", example = "3")
    private Integer retryCount;
    
    @Schema(description = "Timestamp of the last retry attempt")
    private LocalDateTime lastRetryAt;
    
    @Schema(description = "ID of the user related to this email", example = "42")
    private Long relatedUserId;
    
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
} 
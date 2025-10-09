package com.ats.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailNotification extends BaseEntity {
    
    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;
    
    @Column(name = "template_name", nullable = false)
    private String templateName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailStatus status;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "retry_count")
    private Integer retryCount;
    
    @Column(name = "last_retry_at")
    private LocalDateTime lastRetryAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_user_id")
    private User relatedUser;
    
    @Column(name = "bulk_email_campaign_id")
    private String bulkEmailCampaignId;
    
    public enum EmailStatus {
        PENDING,
        SENT,
        FAILED
    }
} 
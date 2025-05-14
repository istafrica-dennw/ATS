package com.ats.controller;

import com.ats.dto.EmailNotificationDTO;
import com.ats.model.EmailNotification;
import com.ats.repository.EmailNotificationRepository;
import com.ats.model.EmailNotification.EmailStatus;
import com.ats.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/emails")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Email Notifications", description = "Endpoints for managing email notifications")
public class EmailNotificationController {

    private final EmailNotificationRepository emailNotificationRepository;
    private final EmailService emailService;

    @GetMapping
    @Operation(summary = "Get all email notifications", description = "Retrieves all email notifications with optional filtering")
    public ResponseEntity<List<EmailNotificationDTO>> getAllEmails(
            @RequestParam(required = false) EmailStatus status,
            @RequestParam(required = false) String recipient,
            @RequestParam(required = false) String templateName) {
        
        List<EmailNotification> emails;
        
        if (status != null) {
            emails = emailNotificationRepository.findByStatus(status);
        } else if (recipient != null) {
            emails = emailNotificationRepository.findByRecipientEmail(recipient);
        } else if (templateName != null) {
            emails = emailNotificationRepository.findByTemplateName(templateName);
        } else {
            emails = emailNotificationRepository.findAll();
        }
        
        List<EmailNotificationDTO> emailDTOs = emails.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(emailDTOs);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get email notification by ID", description = "Retrieves a specific email notification by its ID")
    public ResponseEntity<EmailNotificationDTO> getEmailById(@PathVariable Long id) {
        return emailNotificationRepository.findById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/resend")
    @Operation(summary = "Resend an email", description = "Attempts to resend a failed email notification")
    public ResponseEntity<?> resendEmail(@PathVariable Long id) {
        return emailNotificationRepository.findById(id)
                .map(email -> {
                    try {
                        // Update retry information
                        email.setRetryCount(email.getRetryCount() != null ? email.getRetryCount() + 1 : 1);
                        email.setLastRetryAt(LocalDateTime.now());
                        email.setStatus(EmailStatus.PENDING);
                        emailNotificationRepository.save(email);
                        
                        // Attempt to resend the email based on the template
                        if (email.getTemplateName().equals("verification-email")) {
                            // For verification emails
                            emailService.sendEmailFromNotification(email);
                        } else if (email.getTemplateName().equals("new-user-email") && email.getRelatedUser() != null) {
                            // For new user emails, assuming the email verification token is stored somewhere
                            emailService.sendEmailFromNotification(email);
                        } else {
                            // Generic case
                            emailService.sendEmailFromNotification(email);
                        }
                        
                        // The email service will update the status if successful
                        
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Email resend requested successfully");
                        return ResponseEntity.ok(response);
                    } catch (Exception e) {
                        email.setStatus(EmailStatus.FAILED);
                        email.setErrorMessage(e.getMessage());
                        emailNotificationRepository.save(email);
                        
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Failed to resend email: " + e.getMessage());
                        return ResponseEntity.badRequest().body(response);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/resend-all-failed")
    @Operation(summary = "Resend all failed emails", description = "Attempts to resend all emails with FAILED status")
    public ResponseEntity<?> resendAllFailedEmails() {
        List<EmailNotification> failedEmails = emailNotificationRepository.findAllFailedEmails();
        
        if (failedEmails.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No failed emails found");
            return ResponseEntity.ok(response);
        }
        
        int successCount = 0;
        int failCount = 0;
        
        for (EmailNotification email : failedEmails) {
            try {
                // Update retry information
                email.setRetryCount(email.getRetryCount() != null ? email.getRetryCount() + 1 : 1);
                email.setLastRetryAt(LocalDateTime.now());
                email.setStatus(EmailStatus.PENDING);
                emailNotificationRepository.save(email);
                
                // Attempt to resend the email based on the template
                emailService.sendEmailFromNotification(email);
                
                // The email service will update the status if successful
                successCount++;
            } catch (Exception e) {
                email.setStatus(EmailStatus.FAILED);
                email.setErrorMessage(e.getMessage());
                emailNotificationRepository.save(email);
                
                failCount++;
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Resend operation initiated for " + failedEmails.size() + " emails");
        response.put("totalEmails", failedEmails.size());
        response.put("successCount", successCount);
        response.put("failCount", failCount);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Get email statistics", description = "Retrieves statistics about email notifications")
    public ResponseEntity<Map<String, Object>> getEmailStats() {
        long totalEmails = emailNotificationRepository.count();
        long pendingEmails = emailNotificationRepository.countByStatus(EmailStatus.PENDING);
        long sentEmails = emailNotificationRepository.countByStatus(EmailStatus.SENT);
        long failedEmails = emailNotificationRepository.countByStatus(EmailStatus.FAILED);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmails", totalEmails);
        stats.put("pendingEmails", pendingEmails);
        stats.put("sentEmails", sentEmails);
        stats.put("failedEmails", failedEmails);
        
        return ResponseEntity.ok(stats);
    }
    
    private EmailNotificationDTO convertToDTO(EmailNotification email) {
        return EmailNotificationDTO.builder()
                .id(email.getId())
                .recipientEmail(email.getRecipientEmail())
                .subject(email.getSubject())
                .body(email.getBody())
                .templateName(email.getTemplateName())
                .status(email.getStatus())
                .errorMessage(email.getErrorMessage())
                .retryCount(email.getRetryCount())
                .lastRetryAt(email.getLastRetryAt())
                .relatedUserId(email.getRelatedUser() != null ? email.getRelatedUser().getId() : null)
                .createdAt(email.getCreatedAt())
                .updatedAt(email.getUpdatedAt())
                .build();
    }
} 
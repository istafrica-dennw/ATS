package com.ats.controller;

import com.ats.dto.EmailNotificationDTO;
import com.ats.model.EmailNotification;
import com.ats.model.User;
import com.ats.repository.EmailNotificationRepository;
import com.ats.model.EmailNotification.EmailStatus;
import com.ats.service.EmailService;
import com.ats.service.RegionalDataFilterService;
import com.ats.service.UserService;
import com.ats.dto.UserDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
    private final RegionalDataFilterService regionalDataFilterService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all email notifications", description = "Retrieves all email notifications with optional filtering. Filtered by admin's region.")
    public ResponseEntity<List<EmailNotificationDTO>> getAllEmails(
            @RequestParam(required = false) EmailStatus status,
            @RequestParam(required = false) String recipient,
            @RequestParam(required = false) String templateName,
            Authentication authentication) {
        
        // Get current admin user for regional filtering
        User currentUser = getCurrentUser(authentication);
        
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
        
        // Apply regional filtering based on related user's region
        if (currentUser != null) {
            Boolean viewingAsNonEU = regionalDataFilterService.getViewModeFromSession(currentUser);
            
            emails = emails.stream()
                    .filter(email -> {
                        // If email has no related user, exclude it (or include it - your choice)
                        // For now, we'll exclude emails without related users
                        if (email.getRelatedUser() == null) {
                            return false;
                        }
                        
                        String userRegion = email.getRelatedUser().getRegion();
                        
                        // EU admin viewing as non-EU: show emails for non-EU users
                        if (regionalDataFilterService.isEUAdmin(currentUser) && Boolean.TRUE.equals(viewingAsNonEU)) {
                            return !"EU".equals(userRegion);
                        }
                        
                        // EU admin in default mode: show only emails for EU users
                        if (regionalDataFilterService.isEUAdmin(currentUser)) {
                            return "EU".equals(userRegion);
                        }
                        
                        // Non-EU admins can only see emails for non-EU users
                        if (regionalDataFilterService.isNonEUAdmin(currentUser)) {
                            return !"EU".equals(userRegion);
                        }
                        
                        return true; // Fallback - no restrictions
                    })
                    .collect(Collectors.toList());
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
    @Operation(summary = "Resend all failed emails", description = "Attempts to resend all emails with FAILED status. Only resends emails visible to the current admin based on region.")
    public ResponseEntity<?> resendAllFailedEmails(Authentication authentication) {
        // Get current admin user for regional filtering
        User currentUser = getCurrentUser(authentication);
        
        List<EmailNotification> failedEmails = emailNotificationRepository.findAllFailedEmails();
        
        // Apply regional filtering
        if (currentUser != null) {
            Boolean viewingAsNonEU = regionalDataFilterService.getViewModeFromSession(currentUser);
            
            failedEmails = failedEmails.stream()
                    .filter(email -> {
                        // Exclude emails without related users
                        if (email.getRelatedUser() == null) {
                            return false;
                        }
                        
                        String userRegion = email.getRelatedUser().getRegion();
                        
                        // EU admin viewing as non-EU: show emails for non-EU users
                        if (regionalDataFilterService.isEUAdmin(currentUser) && Boolean.TRUE.equals(viewingAsNonEU)) {
                            return !"EU".equals(userRegion);
                        }
                        
                        // EU admin in default mode: show only emails for EU users
                        if (regionalDataFilterService.isEUAdmin(currentUser)) {
                            return "EU".equals(userRegion);
                        }
                        
                        // Non-EU admins can only see emails for non-EU users
                        if (regionalDataFilterService.isNonEUAdmin(currentUser)) {
                            return !"EU".equals(userRegion);
                        }
                        
                        return true; // Fallback - no restrictions
                    })
                    .collect(Collectors.toList());
        }
        
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
    @Operation(summary = "Get email statistics", description = "Retrieves statistics about email notifications. Filtered by admin's region.")
    public ResponseEntity<Map<String, Object>> getEmailStats(Authentication authentication) {
        // Get current admin user for regional filtering
        User currentUser = getCurrentUser(authentication);
        
        // Get all emails first, then filter
        List<EmailNotification> allEmails = emailNotificationRepository.findAll();
        
        // Apply regional filtering
        if (currentUser != null) {
            Boolean viewingAsNonEU = regionalDataFilterService.getViewModeFromSession(currentUser);
            
            allEmails = allEmails.stream()
                    .filter(email -> {
                        // Exclude emails without related users
                        if (email.getRelatedUser() == null) {
                            return false;
                        }
                        
                        String userRegion = email.getRelatedUser().getRegion();
                        
                        // EU admin viewing as non-EU: show emails for non-EU users
                        if (regionalDataFilterService.isEUAdmin(currentUser) && Boolean.TRUE.equals(viewingAsNonEU)) {
                            return !"EU".equals(userRegion);
                        }
                        
                        // EU admin in default mode: show only emails for EU users
                        if (regionalDataFilterService.isEUAdmin(currentUser)) {
                            return "EU".equals(userRegion);
                        }
                        
                        // Non-EU admins can only see emails for non-EU users
                        if (regionalDataFilterService.isNonEUAdmin(currentUser)) {
                            return !"EU".equals(userRegion);
                        }
                        
                        return true; // Fallback - no restrictions
                    })
                    .collect(Collectors.toList());
        }
        
        // Calculate stats from filtered emails
        long totalEmails = allEmails.size();
        long pendingEmails = allEmails.stream().filter(e -> e.getStatus() == EmailStatus.PENDING).count();
        long sentEmails = allEmails.stream().filter(e -> e.getStatus() == EmailStatus.SENT).count();
        long failedEmails = allEmails.stream().filter(e -> e.getStatus() == EmailStatus.FAILED).count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmails", totalEmails);
        stats.put("pendingEmails", pendingEmails);
        stats.put("sentEmails", sentEmails);
        stats.put("failedEmails", failedEmails);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get current authenticated user
     */
    private User getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        
        try {
            String userEmail = authentication.getName();
            UserDTO userDTO = userService.getUserByEmail(userEmail);
            
            // Convert UserDTO to User entity
            User currentUser = new User();
            currentUser.setId(userDTO.getId());
            currentUser.setEmail(userDTO.getEmail());
            currentUser.setFirstName(userDTO.getFirstName());
            currentUser.setLastName(userDTO.getLastName());
            currentUser.setRole(userDTO.getRole());
            currentUser.setRegion(userDTO.getRegion());
            
            return currentUser;
        } catch (Exception e) {
            return null;
        }
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
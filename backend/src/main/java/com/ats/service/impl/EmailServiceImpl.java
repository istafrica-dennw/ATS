package com.ats.service.impl;

import com.ats.model.EmailNotification;
import com.ats.model.User;
import com.ats.model.Application;
import com.ats.model.EmailEvent;
import com.ats.model.Interview;
import com.ats.model.LocationType;
import com.ats.model.RecipientType;
import com.ats.repository.EmailNotificationRepository;
import com.ats.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.activation.DataSource;
import jakarta.mail.util.ByteArrayDataSource;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.time.ZonedDateTime;

import com.ats.dto.BulkEmailRequestDTO;
import com.ats.dto.BulkEmailResponseDTO;
import com.ats.model.ApplicationStatus;
import com.ats.repository.ApplicationRepository;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailNotificationRepository emailNotificationRepository;
    private final ApplicationRepository applicationRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Email event configuration
     */
    private static class EventConfig {
        final RecipientType recipientType;
        final String subjectTemplate;

        EventConfig(RecipientType recipientType, String subjectTemplate) {
            this.recipientType = recipientType;
            this.subjectTemplate = subjectTemplate;
        }
    }

    // Event configuration mapping
    private final Map<EmailEvent, EventConfig> eventConfigs = Map.of(
        EmailEvent.APPLICATION_RECEIVED, new EventConfig(RecipientType.CANDIDATE, "Application Received - %s"),
        EmailEvent.APPLICATION_REVIEWED, new EventConfig(RecipientType.CANDIDATE, "Application Status Update - %s"),
        EmailEvent.APPLICATION_SHORTLISTED, new EventConfig(RecipientType.CANDIDATE, "Congratulations! You've Been Shortlisted - %s"),
        EmailEvent.INTERVIEW_ASSIGNED_TO_INTERVIEWER, new EventConfig(RecipientType.INTERVIEWER, "New Interview Assignment - %s"),
        EmailEvent.INTERVIEW_ASSIGNED_TO_CANDIDATE, new EventConfig(RecipientType.CANDIDATE, "Interview Scheduled - %s"),
        EmailEvent.INTERVIEW_CANCELLED_TO_CANDIDATE, new EventConfig(RecipientType.CANDIDATE, "Interview Cancelled - %s"),
        EmailEvent.INTERVIEW_CANCELLED_TO_INTERVIEWER, new EventConfig(RecipientType.INTERVIEWER, "Interview Assignment Cancelled - %s"),
        EmailEvent.JOB_OFFER, new EventConfig(RecipientType.CANDIDATE, "Job Offer - %s")
    );

    /**
     * Generic method to send an email with a template and save notification
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param templateName Template name to use
     * @param templateVariables Variables to pass to the template
     * @param user Related user (optional)
     * @return Created EmailNotification entity
     * @throws MessagingException If there's an error sending the email
     */
    @Transactional
    private EmailNotification sendTemplateEmail(String to, String subject, String templateName, 
            Map<String, Object> templateVariables, User user) throws MessagingException {
        
        // Create Thymeleaf context and add variables
        Context context = new Context();
        templateVariables.forEach(context::setVariable);
        
        // Process template
        String emailContent = templateEngine.process(templateName, context);
        
        // Create email notification record
        EmailNotification.EmailNotificationBuilder builder = EmailNotification.builder()
                .recipientEmail(to)
                .subject(subject)
                .body(emailContent)
                .templateName(templateName)
                .status(EmailNotification.EmailStatus.PENDING)
                .retryCount(0);
                
        if (user != null) {
            builder.relatedUser(user);
        }
        
        EmailNotification notification = builder.build();
        
        // Save notification first
        notification = emailNotificationRepository.save(notification);

        try {
            // Try to send the email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("no-reply@ist.africa");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            
            // Update status to SENT
            notification.setStatus(EmailNotification.EmailStatus.SENT);
            return emailNotificationRepository.save(notification);
        } catch (MessagingException e) {
            // Update status to FAILED and save error message
            notification.setStatus(EmailNotification.EmailStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            notification = emailNotificationRepository.save(notification);
            
            // Rethrow the exception for the caller to handle if needed
            throw e;
        } catch (Exception e) {
            // Update status to FAILED and save error message for non-MessagingException
            notification.setStatus(EmailNotification.EmailStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            notification = emailNotificationRepository.save(notification);
            
            // Convert to MessagingException to maintain compatibility with existing method signatures
            MessagingException messagingException = new MessagingException("Failed to send email", e);
            throw messagingException;
        }
    }

    @Override
    @Transactional
    public EmailNotification sendVerificationEmail(String to, String token) throws MessagingException {
        Map<String, Object> templateVars = Map.of(
            "verificationLink", frontendUrl + "/verify-email?token=" + token
        );
        
        return sendTemplateEmail(to, "Verify your email address", "verification-email", templateVars, null);
    }
    
    @Override
    @Transactional
    public EmailNotification sendPasswordResetEmail(String to, String token, User user) throws MessagingException {
        Map<String, Object> templateVars = Map.of(
            "resetLink", frontendUrl + "/reset-password?token=" + token
        );
        
        return sendTemplateEmail(to, "Reset Your Password", "password-reset-email", templateVars, user);
    }
    
    @Override
    @Transactional
    public EmailNotification sendNewUserVerificationEmail(User user, String token) throws MessagingException {
        Map<String, Object> templateVars = Map.of(
            "verificationLink", frontendUrl + "/verify-email?token=" + token,
            "userName", user.getFirstName()
        );
        
        return sendTemplateEmail(user.getEmail(), "Your account has been created", "new-user-email", templateVars, user);
    }

    @Override
    @Transactional
    public EmailNotification sendEmailFromNotification(EmailNotification notification) {
        try {
            // Create a MimeMessage from the notification
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(notification.getRecipientEmail());
            helper.setSubject(notification.getSubject());
            helper.setText(notification.getBody(), true);
            
            // Try to send the email
            mailSender.send(message);
            
            // Update status to SENT
            notification.setStatus(EmailNotification.EmailStatus.SENT);
            return emailNotificationRepository.save(notification);
        } catch (Exception e) {
            // Update status to FAILED and save error message
            notification.setStatus(EmailNotification.EmailStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            return emailNotificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public EmailNotification sendApplicationEmail(Application application, EmailEvent event) throws MessagingException {
        EventConfig config = eventConfigs.get(event);
        if (config == null) {
            throw new IllegalArgumentException("Unsupported email event: " + event);
        }

        // Determine recipient based on event configuration
        String recipientEmail = getRecipientEmail(application, null, config.recipientType);
        User relatedUser = getRelatedUser(application, null, config.recipientType);
        
        // Generate subject
        String subject = String.format(config.subjectTemplate, application.getJob().getTitle());
        
        // Generate template variables based on event
        Map<String, Object> templateVars = buildApplicationTemplateVariables(application, event);
        
        return sendTemplateEmail(recipientEmail, subject, event.getTemplateName(), templateVars, relatedUser);
    }

    @Override
    @Transactional
    public EmailNotification sendInterviewEmail(Interview interview, EmailEvent event) throws MessagingException {
        EventConfig config = eventConfigs.get(event);
        if (config == null) {
            throw new IllegalArgumentException("Unsupported email event: " + event);
        }

        // Determine recipient based on event configuration
        String recipientEmail = getRecipientEmail(interview.getApplication(), interview, config.recipientType);
        User relatedUser = getRelatedUser(interview.getApplication(), interview, config.recipientType);
        
        // Generate subject
        String subject = String.format(config.subjectTemplate, interview.getApplication().getJob().getTitle());
        
        // Generate template variables based on event
        Map<String, Object> templateVars = buildInterviewTemplateVariables(interview, event);
        
        return sendTemplateEmail(recipientEmail, subject, event.getTemplateName(), templateVars, relatedUser);
    }

    /**
     * Determines the recipient email based on the recipient type
     */
    private String getRecipientEmail(Application application, Interview interview, RecipientType recipientType) {
        switch (recipientType) {
            case CANDIDATE:
                return application.getCandidate().getEmail();
            case INTERVIEWER:
                if (interview == null) {
                    throw new IllegalArgumentException("Interview is required for INTERVIEWER recipient type");
                }
                return interview.getInterviewer().getEmail();
            case ADMIN:
                // For now, return the admin who shortlisted (if available)
                return application.getShortlistedBy() != null ? 
                       application.getShortlistedBy().getEmail() : 
                       application.getCandidate().getEmail(); // fallback
            default:
                throw new IllegalArgumentException("Unsupported recipient type: " + recipientType);
        }
    }

    /**
     * Determines the related user based on the recipient type
     */
    private User getRelatedUser(Application application, Interview interview, RecipientType recipientType) {
        switch (recipientType) {
            case CANDIDATE:
                return application.getCandidate();
            case INTERVIEWER:
                if (interview == null) {
                    throw new IllegalArgumentException("Interview is required for INTERVIEWER recipient type");
                }
                return interview.getInterviewer();
            case ADMIN:
                return application.getShortlistedBy();
            default:
                return null;
        }
    }

    /**
     * Builds template variables for application-related emails
     */
    private Map<String, Object> buildApplicationTemplateVariables(Application application, EmailEvent event) {
        Map<String, Object> templateVars = new HashMap<>();
        
        // Common variables for all application emails
        templateVars.put("candidateName", application.getCandidate().getFirstName() + " " + application.getCandidate().getLastName());
        templateVars.put("jobTitle", application.getJob().getTitle());
        templateVars.put("applicationId", application.getId().toString());
        
        // Event-specific variables
        switch (event) {
            case APPLICATION_RECEIVED:
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");
                templateVars.put("applicationDate", application.getCreatedAt().format(formatter));
                break;
            case APPLICATION_REVIEWED:
            case APPLICATION_SHORTLISTED:
                // No additional variables needed for these events
                break;
        }
        
        return templateVars;
    }

    /**
     * Builds template variables for interview-related emails
     */
    private Map<String, Object> buildInterviewTemplateVariables(Interview interview, EmailEvent event) {
        Map<String, Object> templateVars = new HashMap<>();
        Application application = interview.getApplication();
        
        // Common variables for all interview emails
        templateVars.put("candidateName", application.getCandidate().getFirstName() + " " + application.getCandidate().getLastName());
        templateVars.put("jobTitle", application.getJob().getTitle());
        templateVars.put("applicationId", application.getId().toString());
        
        // Add scheduled date if available
        if (interview.getScheduledAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy 'at' hh:mm a");
            templateVars.put("scheduledDate", interview.getScheduledAt().format(formatter));
        }
        
        // Add duration if available
        if (interview.getDurationMinutes() != null) {
            templateVars.put("durationMinutes", interview.getDurationMinutes());
        }
        
        // Add location information
        if (interview.getLocationType() != null) {
            templateVars.put("locationType", interview.getLocationType().getDisplayName());
            if (interview.getLocationType() == LocationType.OFFICE && interview.getLocationAddress() != null) {
                templateVars.put("locationAddress", interview.getLocationAddress());
                templateVars.put("locationInfo", interview.getLocationAddress());
            } else if (interview.getLocationType() == LocationType.ONLINE) {
                templateVars.put("locationInfo", "Online Interview (Meeting link will be provided)");
            } else {
                templateVars.put("locationInfo", "IST Africa Interview Room");
            }
        } else {
            templateVars.put("locationInfo", "IST Africa Interview Room");
        }
        
        // Event-specific variables
        switch (event) {
            case INTERVIEW_ASSIGNED_TO_INTERVIEWER:
                templateVars.put("interviewerName", interview.getInterviewer().getFirstName() + " " + interview.getInterviewer().getLastName());
                templateVars.put("candidateEmail", application.getCandidate().getEmail());
                templateVars.put("interviewTemplate", interview.getSkeleton().getName());
                templateVars.put("interviewerPortalLink", frontendUrl + "/interviewer/dashboard");
                break;
            case INTERVIEW_ASSIGNED_TO_CANDIDATE:
                templateVars.put("candidatePortalLink", frontendUrl + "/candidate/dashboard");
                break;
            case INTERVIEW_CANCELLED_TO_CANDIDATE:
                templateVars.put("interviewTemplate", interview.getSkeleton().getName());
                templateVars.put("candidatePortalLink", frontendUrl + "/candidate/dashboard");
                if (interview.getScheduledAt() != null) {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy 'at' hh:mm a");
                    templateVars.put("scheduledAt", interview.getScheduledAt().format(formatter));
                }
                break;
            case INTERVIEW_CANCELLED_TO_INTERVIEWER:
                templateVars.put("interviewerName", interview.getInterviewer().getFirstName() + " " + interview.getInterviewer().getLastName());
                templateVars.put("interviewTemplate", interview.getSkeleton().getName());
                templateVars.put("interviewerPortalLink", frontendUrl + "/interviewer/dashboard");
                if (interview.getScheduledAt() != null) {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy 'at' hh:mm a");
                    templateVars.put("scheduledAt", interview.getScheduledAt().format(formatter));
                }
                break;
        }
        
        return templateVars;
    }

    @Override
    @Transactional
    public BulkEmailResponseDTO sendBulkEmailToApplicants(BulkEmailRequestDTO request, User senderUser) {
        ZonedDateTime startTime = ZonedDateTime.now();
        
        // Get the list of applications to send emails to
        List<Application> applications = getApplicationsForBulkEmail(request);
        
        List<Long> emailNotificationIds = new ArrayList<>();
        List<BulkEmailResponseDTO.FailedEmailDetail> failures = new ArrayList<>();
        int successCount = 0;
        
        // Send test email first if requested
        if (request.getSendTest() && request.getTestEmailRecipient() != null) {
            try {
                EmailNotification testEmail = sendCustomEmail(
                    request.getTestEmailRecipient(),
                    "[TEST] " + request.getSubject(),
                    request.getContent(),
                    request.getIsHtml(),
                    senderUser
                );
                emailNotificationIds.add(testEmail.getId());
                successCount++;
            } catch (MessagingException e) {
                failures.add(BulkEmailResponseDTO.FailedEmailDetail.builder()
                    .candidateEmail(request.getTestEmailRecipient())
                    .candidateName("Test Recipient")
                    .errorMessage("Test email failed: " + e.getMessage())
                    .build());
            }
        }
        
        // Send emails to all matching applicants
        for (Application application : applications) {
            try {
                // Null checks for safety
                if (application.getCandidate() == null) {
                    failures.add(BulkEmailResponseDTO.FailedEmailDetail.builder()
                        .applicationId(application.getId())
                        .candidateEmail("Unknown")
                        .candidateName("Unknown")
                        .errorMessage("Candidate information is missing for application ID: " + application.getId())
                        .build());
                    continue;
                }
                
                if (application.getJob() == null) {
                    failures.add(BulkEmailResponseDTO.FailedEmailDetail.builder()
                        .applicationId(application.getId())
                        .candidateEmail(application.getCandidate().getEmail())
                        .candidateName(application.getCandidate().getFirstName() + " " + application.getCandidate().getLastName())
                        .errorMessage("Job information is missing for application ID: " + application.getId())
                        .build());
                    continue;
                }
                
                String candidateEmail = application.getCandidate().getEmail();
                if (candidateEmail == null || candidateEmail.trim().isEmpty()) {
                    failures.add(BulkEmailResponseDTO.FailedEmailDetail.builder()
                        .applicationId(application.getId())
                        .candidateEmail("No email")
                        .candidateName(application.getCandidate().getFirstName() + " " + application.getCandidate().getLastName())
                        .errorMessage("Candidate email is missing or empty")
                        .build());
                    continue;
                }
                
                String candidateName = (application.getCandidate().getFirstName() != null ? application.getCandidate().getFirstName() : "") + 
                                     " " + (application.getCandidate().getLastName() != null ? application.getCandidate().getLastName() : "");
                candidateName = candidateName.trim();
                
                // Personalize the content with candidate and job information
                String personalizedContent = personalizeEmailContent(
                    request.getContent(), 
                    application,
                    candidateName
                );
                
                EmailNotification notification = sendCustomEmail(
                    candidateEmail,
                    request.getSubject(),
                    personalizedContent,
                    request.getIsHtml(),
                    senderUser
                );
                
                emailNotificationIds.add(notification.getId());
                successCount++;
                
            } catch (Exception e) {
                String candidateEmail = "Unknown";
                String candidateName = "Unknown";
                
                try {
                    if (application.getCandidate() != null) {
                        candidateEmail = application.getCandidate().getEmail() != null ? application.getCandidate().getEmail() : "No email";
                        candidateName = (application.getCandidate().getFirstName() != null ? application.getCandidate().getFirstName() : "") + 
                                      " " + (application.getCandidate().getLastName() != null ? application.getCandidate().getLastName() : "");
                        candidateName = candidateName.trim();
                    }
                } catch (Exception ignored) {
                    // If we can't get candidate info, use defaults
                }
                
                failures.add(BulkEmailResponseDTO.FailedEmailDetail.builder()
                    .applicationId(application.getId())
                    .candidateEmail(candidateEmail)
                    .candidateName(candidateName)
                    .errorMessage(e.getMessage())
                    .build());
            }
        }
        
        ZonedDateTime completedTime = ZonedDateTime.now();
        int totalAttempted = applications.size() + (request.getSendTest() ? 1 : 0);
        int failureCount = failures.size();
        
        String status;
        if (failureCount == 0) {
            status = "SUCCESS";
        } else if (successCount > 0) {
            status = "PARTIAL_SUCCESS";
        } else {
            status = "FAILED";
        }
        
        return BulkEmailResponseDTO.builder()
            .totalAttempted(totalAttempted)
            .successCount(successCount)
            .failureCount(failureCount)
            .emailNotificationIds(emailNotificationIds)
            .failures(failures)
            .startedAt(startTime)
            .completedAt(completedTime)
            .status(status)
            .build();
    }
    
    @Override
    public List<Application> getApplicantsForBulkEmail(Long jobId, ApplicationStatus status) {
        if (jobId != null && status != null) {
            return applicationRepository.findByJobIdAndStatusWithCandidateAndJob(jobId, status);
        } else if (jobId != null) {
            return applicationRepository.findByJobIdWithCandidateAndJob(jobId);
        } else if (status != null) {
            return applicationRepository.findByStatusWithCandidateAndJob(status);
        } else {
            return applicationRepository.findAllWithCandidateAndJob();
        }
    }
    
    @Override
    @Transactional
    public EmailNotification sendCustomEmail(String to, String subject, String content, Boolean isHtml, User senderUser) throws MessagingException {
        // Create email notification record
        EmailNotification notification = EmailNotification.builder()
            .recipientEmail(to)
            .subject(subject)
            .body(content)
            .status(EmailNotification.EmailStatus.PENDING)
            .templateName("custom-email")
            .relatedUser(senderUser)
            .build();
        
        notification = emailNotificationRepository.save(notification);

        try {
            // Send the email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, isHtml != null ? isHtml : false);
            
            mailSender.send(message);
            
            // Update status to SENT
            notification.setStatus(EmailNotification.EmailStatus.SENT);
            return emailNotificationRepository.save(notification);
        } catch (MessagingException e) {
            // Update status to FAILED and save error message
            notification.setStatus(EmailNotification.EmailStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            notification = emailNotificationRepository.save(notification);
            
            throw e;
        }
    }
    
    private List<Application> getApplicationsForBulkEmail(BulkEmailRequestDTO request) {
        // If specific application IDs are provided, use those
        if (request.getApplicationIds() != null && !request.getApplicationIds().isEmpty()) {
            return applicationRepository.findAllById(request.getApplicationIds())
                .stream()
                .filter(app -> app.getCandidate() != null && app.getJob() != null)
                .toList();
        }
        
        // Otherwise use job and status filters
        return getApplicantsForBulkEmail(request.getJobId(), request.getStatus());
    }
    
    private String personalizeEmailContent(String content, Application application, String candidateName) {
        if (content == null) return content;
        
        // Replace common placeholders with actual values
        String personalizedContent = content
            .replace("{{candidateName}}", candidateName != null ? candidateName : "")
            .replace("{{firstName}}", application.getCandidate().getFirstName() != null ? application.getCandidate().getFirstName() : "")
            .replace("{{lastName}}", application.getCandidate().getLastName() != null ? application.getCandidate().getLastName() : "")
            .replace("{{jobTitle}}", application.getJob().getTitle() != null ? application.getJob().getTitle() : "")
            .replace("{{jobDepartment}}", application.getJob().getDepartment() != null ? application.getJob().getDepartment() : "")
            .replace("{{applicationStatus}}", application.getStatus() != null ? application.getStatus().toString() : "");
        
        return personalizedContent;
    }
    
    @Override
    @Transactional
    public EmailNotification sendEmailWithCalendarAttachment(String to, String subject, String content, 
                                                           String calendarContent, String attachmentName) throws MessagingException {
        // Create email notification record
        EmailNotification notification = EmailNotification.builder()
            .recipientEmail(to)
            .subject(subject)
            .body(content)
            .status(EmailNotification.EmailStatus.PENDING)
            .templateName("calendar-invite")
            .retryCount(0)
            .build();
        
        notification = emailNotificationRepository.save(notification);

        try {
            // Create the email message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("no-reply@ist.africa");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, false); // Plain text email
            
            // Add calendar attachment with proper MIME type for Outlook compatibility
            DataSource dataSource = new ByteArrayDataSource(calendarContent.getBytes("UTF-8"), "text/calendar; method=PUBLISH");
            helper.addAttachment(attachmentName, dataSource);
            
            // Send the email
            mailSender.send(message);
            
            // Update status to SENT
            notification.setStatus(EmailNotification.EmailStatus.SENT);
            return emailNotificationRepository.save(notification);
            
        } catch (Exception e) {
            // Update status to FAILED and save error message
            notification.setStatus(EmailNotification.EmailStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            notification = emailNotificationRepository.save(notification);
            
            throw new MessagingException("Failed to send email with calendar attachment", e);
        }
    }
} 
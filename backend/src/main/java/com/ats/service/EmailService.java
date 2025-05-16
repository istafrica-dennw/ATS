package com.ats.service;

import com.ats.model.EmailNotification;
import com.ats.model.User;
import com.ats.repository.EmailNotificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailNotificationRepository emailNotificationRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

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

    /**
     * Sends a verification email and saves the notification in the database
     * @param to The recipient email address
     * @param token The verification token
     * @return The created EmailNotification entity
     * @throws MessagingException If there's an error sending the email
     */
    @Transactional
    public EmailNotification sendVerificationEmail(String to, String token) throws MessagingException {
        Map<String, Object> templateVars = Map.of(
            "verificationLink", frontendUrl + "/verify-email?token=" + token
        );
        
        return sendTemplateEmail(to, "Verify your email address", "verification-email", templateVars, null);
    }
    
    /**
     * Sends a password reset email with a token
     * @param to The recipient email address
     * @param token The password reset token
     * @param user The user to send the email to
     * @return The created EmailNotification entity
     */
    @Transactional
    public EmailNotification sendPasswordResetEmail(String to, String token, User user) throws MessagingException {
        Map<String, Object> templateVars = Map.of(
            "resetLink", frontendUrl + "/reset-password?token=" + token
        );
        
        return sendTemplateEmail(to, "Reset Your Password", "password-reset-email", templateVars, user);
    }
    
    /**
     * Sends a verification email to a new user created by an admin
     * @param user The user to send the email to
     * @param token The verification token
     * @return The created EmailNotification entity
     */
    @Transactional
    public EmailNotification sendNewUserVerificationEmail(User user, String token) throws MessagingException {
        Map<String, Object> templateVars = Map.of(
            "verificationLink", frontendUrl + "/verify-email?token=" + token,
            "userName", user.getFirstName()
        );
        
        return sendTemplateEmail(user.getEmail(), "Your account has been created", "new-user-email", templateVars, user);
    }

    /**
     * Sends an email based on an existing EmailNotification record
     * @param notification The EmailNotification to resend
     * @return The updated EmailNotification
     */
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
} 
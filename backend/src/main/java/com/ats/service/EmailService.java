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

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailNotificationRepository emailNotificationRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Sends a verification email and saves the notification in the database
     * @param to The recipient email address
     * @param token The verification token
     * @return The created EmailNotification entity
     * @throws MessagingException If there's an error sending the email
     */
    @Transactional
    public EmailNotification sendVerificationEmail(String to, String token) throws MessagingException {
        Context context = new Context();
        context.setVariable("verificationLink", frontendUrl + "/verify-email?token=" + token);

        String emailContent = templateEngine.process("verification-email", context);
        String subject = "Verify your email address";
        
        // Create email notification record
        EmailNotification notification = EmailNotification.builder()
                .recipientEmail(to)
                .subject(subject)
                .body(emailContent)
                .templateName("verification-email")
                .status(EmailNotification.EmailStatus.PENDING)
                .retryCount(0)
                .build();
        
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
        }
    }
    
    /**
     * Sends a verification email to a new user created by an admin
     * @param user The user to send the email to
     * @param token The verification token
     * @return The created EmailNotification entity
     */
    @Transactional
    public EmailNotification sendNewUserVerificationEmail(User user, String token) {
        Context context = new Context();
        context.setVariable("verificationLink", frontendUrl + "/verify-email?token=" + token);
        context.setVariable("userName", user.getFirstName());
        
        String emailContent = templateEngine.process("new-user-email", context);
        String subject = "Your account has been created";
        
        // Create email notification record
        EmailNotification notification = EmailNotification.builder()
                .recipientEmail(user.getEmail())
                .subject(subject)
                .body(emailContent)
                .templateName("new-user-email")
                .status(EmailNotification.EmailStatus.PENDING)
                .retryCount(0)
                .relatedUser(user)
                .build();
        
        // Save notification first
        notification = emailNotificationRepository.save(notification);

        try {
            // Try to send the email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(emailContent, true);
            
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
package com.ats.service;

import com.ats.model.EmailNotification;
import com.ats.model.User;
import com.ats.model.Application;
import com.ats.model.EmailEvent;
import com.ats.model.Job;
import com.ats.model.RecipientType;
import com.ats.model.Interview;
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
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.HashMap;

/**
 * Service interface for handling email operations
 */
public interface EmailService {
    
    /**
     * Sends a verification email and saves the notification in the database
     * @param to The recipient email address
     * @param token The verification token
     * @return The created EmailNotification entity
     * @throws MessagingException If there's an error sending the email
     */
    EmailNotification sendVerificationEmail(String to, String token) throws MessagingException;
    
    /**
     * Sends a password reset email with a token
     * @param to The recipient email address
     * @param token The password reset token
     * @param user The user to send the email to
     * @return The created EmailNotification entity
     */
    EmailNotification sendPasswordResetEmail(String to, String token, User user) throws MessagingException;
    
    /**
     * Sends a verification email to a new user created by an admin
     * @param user The user to send the email to
     * @param token The verification token
     * @return The created EmailNotification entity
     */
    EmailNotification sendNewUserVerificationEmail(User user, String token) throws MessagingException;

    /**
     * Sends an email based on an existing EmailNotification record
     * @param notification The EmailNotification to resend
     * @return The updated EmailNotification
     */
    EmailNotification sendEmailFromNotification(EmailNotification notification);

    /**
     * Sends an application-related email based on the event type
     * @param application The application involved in the event
     * @param event The type of email event
     * @return The created EmailNotification entity
     * @throws MessagingException If there's an error sending the email
     */
    EmailNotification sendApplicationEmail(Application application, EmailEvent event) throws MessagingException;

    /**
     * Sends an interview-related email based on the event type
     * @param interview The interview involved in the event
     * @param event The type of email event
     * @return The created EmailNotification entity
     * @throws MessagingException If there's an error sending the email
     */
    EmailNotification sendInterviewEmail(Interview interview, EmailEvent event) throws MessagingException;
} 
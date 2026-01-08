package com.ats.service.mail;

import jakarta.activation.DataSource;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

/**
 * AWS SES Mail Provider
 * Used for ist.africa domain (Rwanda/Africa region)
 *
 * Uses the existing Spring JavaMailSender configured with AWS SES SMTP credentials.
 */
@Component
@RequiredArgsConstructor
public class AwsMailProvider implements MailProvider {

    private static final Logger logger = LoggerFactory.getLogger(AwsMailProvider.class);

    private final JavaMailSender mailSender;

    @Value("${mail.aws.from-address:no-reply@ist.africa}")
    private String defaultFromAddress;

    @Value("${mail.aws.enabled:true}")
    private boolean enabled;

    @Override
    public void sendEmail(String to, String from, String subject, String htmlContent)
            throws MessagingException {
        logger.info("📧 [AWS SES] Sending email to {} from {}", to, from);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = isHtml

            mailSender.send(message);
            logger.info("✅ [AWS SES] Email sent successfully to {}", to);

        } catch (Exception e) {
            logger.error("❌ [AWS SES] Failed to send email to {}: {}", to, e.getMessage());
            throw new MessagingException("AWS SES failed to send email: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendEmailWithAttachment(String to, String from, String subject, String htmlContent,
                                        String attachmentName, byte[] attachmentContent,
                                        String attachmentMimeType) throws MessagingException {
        logger.info("📧 [AWS SES] Sending email with attachment to {} from {}", to, from);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Add attachment
            DataSource dataSource = new ByteArrayDataSource(attachmentContent, attachmentMimeType);
            helper.addAttachment(attachmentName, dataSource);

            mailSender.send(message);
            logger.info("✅ [AWS SES] Email with attachment sent successfully to {}", to);

        } catch (Exception e) {
            logger.error("❌ [AWS SES] Failed to send email with attachment to {}: {}", to, e.getMessage());
            throw new MessagingException("AWS SES failed to send email: " + e.getMessage(), e);
        }
    }

    @Override
    public String getDefaultFromAddress() {
        return defaultFromAddress;
    }

    @Override
    public String getProviderName() {
        return "AWS SES";
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
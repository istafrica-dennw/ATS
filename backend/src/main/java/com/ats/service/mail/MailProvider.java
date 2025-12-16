package com.ats.service.mail;

import jakarta.mail.MessagingException;

public interface MailProvider {

    /**
     * Send a simple HTML email
     *
     * @param to Recipient email address
     * @param from Sender email address
     * @param subject Email subject
     * @param htmlContent HTML content of the email
     * @throws MessagingException if sending fails
     */
    void sendEmail(String to, String from, String subject, String htmlContent) throws MessagingException;

    /**
     * Send email with an attachment (for calendar invites, etc.)
     *
     * @param to Recipient email address
     * @param from Sender email address
     * @param subject Email subject
     * @param htmlContent HTML content
     * @param attachmentName Name of the attachment file
     * @param attachmentContent Attachment content as bytes
     * @param attachmentMimeType MIME type (e.g., "text/calendar")
     * @throws MessagingException if sending fails
     */
    void sendEmailWithAttachment(String to, String from, String subject, String htmlContent,
                                 String attachmentName, byte[] attachmentContent,
                                 String attachmentMimeType) throws MessagingException;

    /**
     * Get the default "from" address for this provider
     * @return Default sender email address
     */
    String getDefaultFromAddress();

    /**
     * Get the provider name for logging
     * @return Provider name (e.g., "AWS SES", "Postal")
     */
    String getProviderName();

    /**
     * Check if this provider is enabled and properly configured
     * @return true if provider can be used
     */
    boolean isEnabled();
}

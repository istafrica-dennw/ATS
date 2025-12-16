package com.ats.service.mail;

import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Postal Mail Provider
 * Used for ats.ist.com domain (EU/Nordic region)
 * 
 * Implements the Postal HTTP API as documented at:
 * https://docs.postalserver.io/developer/api
 * 
 * API Endpoint: POST /api/v1/send/message
 * Authentication: X-Server-API-Key header
 */
@Component
public class PostalMailProvider implements MailProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(PostalMailProvider.class);
    
    private final RestTemplate restTemplate;
    
    @Value("${mail.postal.api-url:}")
    private String postalApiUrl;
    
    @Value("${mail.postal.api-key:}")
    private String postalApiKey;
    
    @Value("${mail.postal.from-address:no-reply@ats.ist.com}")
    private String defaultFromAddress;
    
    @Value("${mail.postal.enabled:false}")
    private boolean enabled;
    
    public PostalMailProvider() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Send email via Postal API
     * 
     * Postal API Request Format (from docs):
     * POST /api/v1/send/message
     * {
     *   "to": ["recipient@example.com"],
     *   "from": "sender@yourdomain.com",
     *   "subject": "Subject line",
     *   "html_body": "<p>HTML content</p>"
     * }
     */
    @Override
    public void sendEmail(String to, String from, String subject, String htmlContent) 
            throws MessagingException {
        
        if (!isEnabled()) {
            throw new MessagingException("Postal mail provider is not enabled or not configured");
        }
        
        logger.info("📧 [POSTAL] Sending email to {} from {}", to, from);
        
        try {
            // Build request body according to Postal API specification
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("to", List.of(to));
            requestBody.put("from", from);
            requestBody.put("subject", subject);
            requestBody.put("html_body", htmlContent);
            
            // Send to Postal API
            Map<String, Object> response = callPostalApi(requestBody);
            
            // Check response
            if ("success".equals(response.get("status"))) {
                logger.info("✅ [POSTAL] Email sent successfully to {} - Message ID: {}", 
                    to, response.get("data"));
            } else {
                throw new MessagingException("Postal API returned error: " + response);
            }
            
        } catch (MessagingException e) {
            throw e;
        } catch (Exception e) {
            logger.error("❌ [POSTAL] Failed to send email to {}: {}", to, e.getMessage());
            throw new MessagingException("Postal failed to send email: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send email with attachment via Postal API
     * 
     * Postal attachment format:
     * {
     *   "attachments": [
     *     {
     *       "name": "file.ics",
     *       "content_type": "text/calendar",
     *       "data": "base64-encoded-content"
     *     }
     *   ]
     * }
     */
    @Override
    public void sendEmailWithAttachment(String to, String from, String subject, String htmlContent,
                                         String attachmentName, byte[] attachmentContent, 
                                         String attachmentMimeType) throws MessagingException {
        
        if (!isEnabled()) {
            throw new MessagingException("Postal mail provider is not enabled or not configured");
        }
        
        logger.info("📧 [POSTAL] Sending email with attachment '{}' to {} from {}", 
            attachmentName, to, from);
        
        try {
            // Build request body with attachment
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("to", List.of(to));
            requestBody.put("from", from);
            requestBody.put("subject", subject);
            requestBody.put("html_body", htmlContent);
            
            // Build attachment object
            Map<String, String> attachment = new LinkedHashMap<>();
            attachment.put("name", attachmentName);
            attachment.put("content_type", attachmentMimeType);
            attachment.put("data", Base64.getEncoder().encodeToString(attachmentContent));
            
            requestBody.put("attachments", List.of(attachment));
            
            // Send to Postal API
            Map<String, Object> response = callPostalApi(requestBody);
            
            // Check response
            if ("success".equals(response.get("status"))) {
                logger.info("✅ [POSTAL] Email with attachment sent successfully to {}", to);
            } else {
                throw new MessagingException("Postal API returned error: " + response);
            }
            
        } catch (MessagingException e) {
            throw e;
        } catch (Exception e) {
            logger.error("❌ [POSTAL] Failed to send email with attachment to {}: {}", to, e.getMessage());
            throw new MessagingException("Postal failed to send email: " + e.getMessage(), e);
        }
    }
    
    /**
     * Call Postal API with the given request body
     * 
     * @param requestBody The JSON body to send
     * @return Response from Postal API as a Map
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> callPostalApi(Map<String, Object> requestBody) throws Exception {
        // Prepare headers with API key authentication
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Server-API-Key", postalApiKey);
        
        // Create request entity
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        // Build API endpoint URL
        String apiEndpoint = postalApiUrl.replaceAll("/$", "") + "/api/v1/send/message";
        
        logger.debug("[POSTAL] Calling API: {}", apiEndpoint);
        
        // Make the API call
        ResponseEntity<Map> response = restTemplate.exchange(
            apiEndpoint,
            HttpMethod.POST,
            entity,
            Map.class
        );
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new Exception("Postal API returned status: " + response.getStatusCode());
        }
    }
    
    @Override
    public String getDefaultFromAddress() {
        return defaultFromAddress;
    }
    
    @Override
    public String getProviderName() {
        return "Postal";
    }
    
    @Override
    public boolean isEnabled() {
        return enabled 
            && postalApiUrl != null && !postalApiUrl.isEmpty() 
            && postalApiKey != null && !postalApiKey.isEmpty();
    }
}
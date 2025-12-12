package com.ats.service.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Factory to select the appropriate mail provider based on job region
 * 
 * Selection logic:
 * - RW region (IST Africa jobs) → AWS SES (no-reply@ist.africa)
 * - All other regions (EU, OTHER, null) → Postal (no-reply@ats.ist.com) [DEFAULT]
 */
@Component
public class MailProviderFactory {
    
    private static final Logger logger = LoggerFactory.getLogger(MailProviderFactory.class);
    
    private final AwsMailProvider awsMailProvider;
    private final PostalMailProvider postalMailProvider;
    
    public MailProviderFactory(AwsMailProvider awsMailProvider, PostalMailProvider postalMailProvider) {
        this.awsMailProvider = awsMailProvider;
        this.postalMailProvider = postalMailProvider;
    }
    
    /**
     * Get the appropriate mail provider for a given job region
     * 
     * @param region The job's region (EU, RW, OTHER, or null)
     * @return The appropriate MailProvider instance
     */
    public MailProvider getProvider(String region) {
        // RW region (IST Africa jobs) use AWS SES (ist.africa)
        if (region == null) {
            if (postalMailProvider.isEnabled()) {
                logger.debug("👤 Selected Postal provider for user-related email (no-reply@ats.ist.com)");
                return postalMailProvider;
            }
            logger.warn("⚠️ Postal provider not enabled, falling back to AWS SES for user email");
            return awsMailProvider;
        }
        
         // RW region or jobs without region (DEFAULT_JOB_REGION) → AWS SES (ist.africa)
        if ("RW".equalsIgnoreCase(region) || "DEFAULT_JOB_REGION".equals(region)) {
            logger.debug("🌍 Selected AWS SES provider for IST Africa, region: {} (no-reply@ist.africa)", region);
            return awsMailProvider;
        }
        
        // EU, OTHER, and any other regions → Postal (ats.ist.com)
        if (postalMailProvider.isEnabled()) {
            logger.debug("🌍 Selected Postal provider for job region: {} (no-reply@ats.ist.com)", region);
            return postalMailProvider;
        } else {
            logger.warn("⚠️ Postal provider not enabled, falling back to AWS SES");
            return awsMailProvider;
        }
    }
    
    /**
     * Get the default provider (Postal for ats.ist.com)
     * Used when region is unknown or null
     * 
     * @return Postal mail provider if enabled, otherwise AWS SES as fallback
     */
    public MailProvider getDefaultProvider() {
        if (postalMailProvider.isEnabled()) {
            return postalMailProvider;
        }
        logger.warn("⚠️ Postal provider not enabled, falling back to AWS SES for default");
        return awsMailProvider;
    }
    
    /**
     * Get the Postal provider (ats.ist.com) - now the default provider
     * 
     * @return Postal mail provider if enabled, otherwise AWS SES as fallback
     */
    public MailProvider getPostalProvider() {
        if (postalMailProvider.isEnabled()) {
            return postalMailProvider;
        }
        logger.warn("⚠️ Postal provider not enabled, falling back to AWS SES");
        return awsMailProvider;
    }
    
    /**
     * Get the IST Africa provider (AWS SES for ist.africa)
     * Used specifically for RW region job-related emails
     * 
     * @return AWS SES mail provider
     */
    public MailProvider getIstAfricaProvider() {
        return awsMailProvider;
    }
    
    /**
     * Check if Postal provider is available
     * 
     * @return true if Postal is enabled and configured
     */
    public boolean isPostalAvailable() {
        return postalMailProvider.isEnabled();
    }
}
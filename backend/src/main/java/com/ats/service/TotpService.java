package com.ats.service;

/**
 * Service interface for Time-based One-Time Password (TOTP) operations
 * Used for implementing two-factor authentication (2FA)
 */
public interface TotpService {
    
    /**
     * Generate a new secret key for TOTP
     * @return The generated secret key
     */
    String generateSecret();
    
    /**
     * Generate a QR code URL that can be used by Google Authenticator or similar apps
     * @param email The user's email
     * @param secret The TOTP secret key
     * @return A URL for the QR code image
     */
    String generateQrCodeImageUrl(String email, String secret);
    
    /**
     * Validate a TOTP code against a secret
     * @param code The TOTP code to validate
     * @param secret The secret key
     * @return true if the code is valid
     */
    boolean validateCode(String code, String secret);
    
    /**
     * Generate recovery codes for a user
     * @return An array of recovery codes
     */
    String[] generateRecoveryCodes();
    
    /**
     * Check if a recovery code is valid for a user
     * @param providedCode The recovery code to check
     * @param storedCodes The array of stored recovery codes
     * @return The array with the used code removed if valid, or null if invalid
     */
    String[] validateAndRemoveRecoveryCode(String providedCode, String[] storedCodes);
} 
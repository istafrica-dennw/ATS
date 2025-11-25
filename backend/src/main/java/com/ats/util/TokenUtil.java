package com.ats.util;

import com.ats.model.User;
import com.ats.model.PasswordResetToken;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Utility class for token-related operations
 */
public class TokenUtil {

    /**
     * Generate a verification token for a user and set the token and expiry time
     * @param user The user to generate and set the token for
     * @return The generated token
     */
    public static String generateVerificationToken(User user) {
        String verificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        user.setIsEmailVerified(false);
        return verificationToken;
    }
    
    /**
     * Create a password reset token for a user
     * @param user The user to create the token for
     * @return The PasswordResetToken entity (not yet persisted)
     */
    public static PasswordResetToken createPasswordResetToken(User user) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);
        
        return PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .isUsed(false)
                .build();
    }
    
    /**
     * Generate a Connect consent token for a user and set the token and expiry time
     * @param user The user to generate and set the token for
     * @return The generated token
     */
    public static String generateConnectConsentToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setConnectConsentToken(token);
        user.setConnectConsentTokenExpiry(LocalDateTime.now().plusDays(7)); // 7 days expiry
        return token;
    }
} 
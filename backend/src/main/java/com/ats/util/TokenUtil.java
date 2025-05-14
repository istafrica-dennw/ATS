package com.ats.util;

import com.ats.model.User;
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
} 
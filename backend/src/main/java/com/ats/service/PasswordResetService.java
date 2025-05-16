package com.ats.service;

import com.ats.dto.ForgotPasswordRequest;
import com.ats.dto.ResetPasswordRequest;

/**
 * Service interface for managing password reset operations
 */
public interface PasswordResetService {
    
    /**
     * Process a forgot password request and send a reset email if the user exists
     * @param request The forgot password request containing the email
     * @return true if the process completed successfully (email found or not)
     */
    boolean processForgotPasswordRequest(ForgotPasswordRequest request);
    
    /**
     * Reset a user's password using a valid token
     * @param request The reset password request containing the token and new password
     * @return true if the password was reset successfully
     */
    boolean resetPassword(ResetPasswordRequest request);
} 
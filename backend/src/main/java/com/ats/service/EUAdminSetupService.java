package com.ats.service;

import com.ats.model.User;
import com.ats.model.Region;

/**
 * Service for EU admin setup logic
 */
public interface EUAdminSetupService {
    
    /**
     * Check if any EU admin already exists in the system
     * @return true if at least one EU admin exists
     */
    boolean hasEUAdmin();
    
    /**
     * Check if the current user can become the first EU admin
     * @param user the user to check
     * @param isEUAccess whether the user is accessing from EU
     * @return true if the user can become the first EU admin
     */
    boolean canBecomeFirstEUAdmin(User user, boolean isEUAccess);
    
    /**
     * Set a user as the first EU admin
     * @param userId the user ID to set as EU admin
     * @param isEUAccess whether the user is accessing from EU
     * @return the updated user
     */
    User setFirstEUAdmin(Long userId, boolean isEUAccess);
    
    /**
     * Check if a user can assign other users to EU region
     * @param user the user to check
     * @return true if the user can assign EU region to others
     */
    boolean canAssignEURegion(User user);
}
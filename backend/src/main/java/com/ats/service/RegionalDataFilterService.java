package com.ats.service;

import com.ats.model.User;
import com.ats.model.Region;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for regional data filtering to ensure GDPR compliance
 */
public interface RegionalDataFilterService {
    
    /**
     * Get the accessible region for a user based on their admin privileges
     * @param user the user to check
     * @return the region this user can access (EU, null, or null for all)
     */
    String getAccessibleRegion(User user);
    
    /**
     * Check if a user can access data from a specific region
     * @param user the user to check
     * @param targetRegion the region to check access for
     * @return true if the user can access data from the target region
     */
    boolean canAccessRegion(User user, String targetRegion);
    
    /**
     * Get the region filter condition for database queries
     * @param user the user to get filter for
     * @return the region filter string for WHERE clause
     */
    String getRegionFilterCondition(User user);
    
    /**
     * Check if user is EU admin
     * @param user the user to check
     * @return true if user is EU admin
     */
    boolean isEUAdmin(User user);
    
    /**
     * Check if user is non-EU admin
     * @param user the user to check
     * @return true if user is non-EU admin
     */
    boolean isNonEUAdmin(User user);
}
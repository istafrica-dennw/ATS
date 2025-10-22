package com.ats.service.impl;

import com.ats.model.User;
import com.ats.model.Region;
import com.ats.model.Role;
import com.ats.service.RegionalDataFilterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Implementation of regional data filter service for GDPR compliance
 */
@Service
public class RegionalDataFilterServiceImpl implements RegionalDataFilterService {
    
    private static final Logger logger = LoggerFactory.getLogger(RegionalDataFilterServiceImpl.class);
    
    @Override
    public String getAccessibleRegion(User user) {
        if (user == null) {
            return null;
        }
        
        // Only admins have regional restrictions
        if (user.getRole() != Role.ADMIN) {
            return null; // Non-admins can see all data (no restrictions)
        }
        
        // EU admins can only see EU data
        if ("EU".equals(user.getRegion())) {
            return "EU";
        }
        
        // Non-EU admins can only see non-EU data (region = null or other regions)
        return "NON_EU";
    }
    
    @Override
    public boolean canAccessRegion(User user, String targetRegion) {
        if (user == null || targetRegion == null) {
            return false;
        }
        
        // Only admins have regional restrictions
        if (user.getRole() != Role.ADMIN) {
            return true; // Non-admins can access all regions
        }
        
        // EU admins can only access EU data
        if (isEUAdmin(user)) {
            return "EU".equals(targetRegion);
        }
        
        // Non-EU admins can only access non-EU data
        if (isNonEUAdmin(user)) {
            return !"EU".equals(targetRegion);
        }
        
        return false;
    }
    
    @Override
    public String getRegionFilterCondition(User user) {
        if (user == null) {
            return null;
        }
        
        // Only admins have regional restrictions
        if (user.getRole() != Role.ADMIN) {
            return null; // No filter for non-admins
        }
        
        // EU admins can only see EU data
        if (isEUAdmin(user)) {
            return "region = 'EU'";
        }
        
        // Non-EU admins can only see non-EU data (region != 'EU' or region is null)
        if (isNonEUAdmin(user)) {
            return "(region IS NULL OR region != 'EU')";
        }
        
        return null;
    }
    
    @Override
    public boolean isEUAdmin(User user) {
        if (user == null) {
            return false;
        }
        
        return user.getRole() == Role.ADMIN && "EU".equals(user.getRegion());
    }
    
    @Override
    public boolean isNonEUAdmin(User user) {
        if (user == null) {
            return false;
        }
        
        return user.getRole() == Role.ADMIN && !"EU".equals(user.getRegion());
    }
}
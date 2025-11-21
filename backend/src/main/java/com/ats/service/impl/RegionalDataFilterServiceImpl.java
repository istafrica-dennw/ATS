package com.ats.service.impl;

import com.ats.model.User;
import com.ats.model.Role;
import com.ats.service.RegionalDataFilterService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

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
    
    @Override
    public boolean canViewNonEUData(User user, Boolean viewingAsNonEU) {
        if (user == null) {
            return false;
        }
        
        // Only EU admins can switch to view non-EU data
        if (isEUAdmin(user) && Boolean.TRUE.equals(viewingAsNonEU)) {
            return true;
        }
        
        // Non-EU admins can always view non-EU data (their default)
        if (isNonEUAdmin(user)) {
            return true;
        }
        
        return false;
    }
    
    @Override
    public String getEffectiveRegionFilter(User user, Boolean viewingAsNonEU) {
        if (user == null) {
            return null;
        }
        
        // Only admins have regional restrictions
        if (user.getRole() != Role.ADMIN) {
            return null; // No filter for non-admins
        }
        
        // EU admin viewing as non-EU: show non-EU data
        if (isEUAdmin(user) && Boolean.TRUE.equals(viewingAsNonEU)) {
            return "(region IS NULL OR region != 'EU')";
        }
        
        // EU admin in default mode: show only EU data
        if (isEUAdmin(user)) {
            return "region = 'EU'";
        }
        
        // Non-EU admin: show non-EU data
        if (isNonEUAdmin(user)) {
            return "(region IS NULL OR region != 'EU')";
        }
        
        return null;
    }
    
    @Override
    public Boolean getViewModeFromSession(User user) {
        if (user == null) {
            return false;
        }
        
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return false;
            }
            
            HttpServletRequest request = attributes.getRequest();
            Boolean viewingAsNonEU = (Boolean) request.getSession().getAttribute("viewingAsNonEU_" + user.getId());
            return viewingAsNonEU != null ? viewingAsNonEU : false;
        } catch (Exception e) {
            logger.warn("Error getting view mode from session: {}", e.getMessage());
            return false;
        }
    }
}
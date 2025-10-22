package com.ats.service.impl;

import com.ats.model.User;
import com.ats.model.Region;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import com.ats.service.EUAdminSetupService;
import com.ats.service.GeolocationService;
import com.ats.util.IPUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of EU admin setup service
 */
@Service
public class EUAdminSetupServiceImpl implements EUAdminSetupService {
    
    private static final Logger logger = LoggerFactory.getLogger(EUAdminSetupServiceImpl.class);
    
    private final UserRepository userRepository;
    private final GeolocationService geolocationService;
    
    @Autowired
    public EUAdminSetupServiceImpl(UserRepository userRepository, GeolocationService geolocationService) {
        this.userRepository = userRepository;
        this.geolocationService = geolocationService;
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasEUAdmin() {
        // Check if any user has region = 'EU' and role = 'ADMIN'
        return userRepository.existsByRegionAndRole("EU", Role.ADMIN);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean canBecomeFirstEUAdmin(User user, boolean isEUAccess) {
        // User must be an admin
        if (user.getRole() != Role.ADMIN) {
            logger.debug("User {} is not an admin, cannot become EU admin", user.getEmail());
            return false;
        }
        
        // User must be accessing from EU
        if (!isEUAccess) {
            logger.debug("User {} is not accessing from EU, cannot become EU admin", user.getEmail());
            return false;
        }
        
        // No EU admin should exist yet
        if (hasEUAdmin()) {
            logger.debug("EU admin already exists, user {} cannot become first EU admin", user.getEmail());
            return false;
        }
        
        // User should not already have a region set
        if (user.getRegion() != null) {
            logger.debug("User {} already has region set to {}, cannot become EU admin", user.getEmail(), user.getRegion());
            return false;
        }
        
        return true;
    }
    
    @Override
    @Transactional
    public User setFirstEUAdmin(Long userId, boolean isEUAccess) {
        if (!isEUAccess) {
            throw new IllegalArgumentException("User must be accessing from EU to become EU admin");
        }
        
        if (hasEUAdmin()) {
            throw new IllegalStateException("EU admin already exists in the system");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("User must be an admin to become EU admin");
        }
        
        if (user.getRegion() != null) {
            throw new IllegalArgumentException("User already has a region assigned");
        }
        
        // Set user's region to EU
        user.setRegion("EU");
        User savedUser = userRepository.save(user);
        
        logger.info("User {} has been set as the first EU admin", user.getEmail());
        return savedUser;
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean canAssignEURegion(User user) {
        // User must be an EU admin
        return "EU".equals(user.getRegion()) && user.getRole() == Role.ADMIN;
    }
}
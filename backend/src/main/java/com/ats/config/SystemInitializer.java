package com.ats.config;

import com.ats.model.Role;
import com.ats.model.User;
import com.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * SystemInitializer is responsible for ensuring a default admin account exists
 * when the application starts. If other admin accounts are found, the default
 * account is disabled.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SystemInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // Default admin credentials
    @Value("${app.admin.email:admin@ats.istafrica}")
    private String defaultAdminEmail;
    
    @Value("${app.admin.password:admin@atsafrica}")
    private String defaultAdminPassword;

    /**
     * This method runs when the application is fully started.
     * It ensures that at least one admin account exists in the system.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeSystem() {
        log.info("Initializing system - checking for admin accounts");
        
        // Find all admin users
        List<User> adminUsers = userRepository.findByRole(Role.ADMIN);
        
        // Check if default admin exists
        User defaultAdmin = userRepository.findByEmail(defaultAdminEmail).orElse(null);
        
        if (adminUsers.isEmpty()) {
            // No admin users found, create default admin if it doesn't exist
            if (defaultAdmin == null) {
                createDefaultAdmin();
                log.info("Created default admin account: {}", defaultAdminEmail);
            } else if (!defaultAdmin.getIsActive()) {
                // Default admin exists but is inactive, activate it
                defaultAdmin.setIsActive(true);
                userRepository.save(defaultAdmin);
                log.info("Activated existing default admin account: {}", defaultAdminEmail);
            }
        } else {
            // Other admin users exist
            if (defaultAdmin != null && defaultAdmin.getIsActive()) {
                // If default admin exists and is active, check if it's the only admin
                boolean hasOtherActiveAdmins = adminUsers.stream()
                    .anyMatch(user -> !user.getEmail().equals(defaultAdminEmail) && user.getIsActive());
                
                if (hasOtherActiveAdmins) {
                    // Disable default admin since other active admins exist
                    defaultAdmin.setIsActive(false);
                    userRepository.save(defaultAdmin);
                    log.info("Disabled default admin account due to other active admin accounts");
                }
            }
        }
    }
    
    /**
     * Creates the default admin account
     */
    private void createDefaultAdmin() {
        User admin = new User();
        admin.setEmail(defaultAdminEmail);
        admin.setPasswordHash(passwordEncoder.encode(defaultAdminPassword));
        admin.setFirstName("System");
        admin.setLastName("Administrator");
        admin.setRole(Role.ADMIN);
        admin.setIsActive(true);
        admin.setIsEmailVerified(true);
        admin.setIsEmailPasswordEnabled(true);
        
        userRepository.save(admin);
    }
} 
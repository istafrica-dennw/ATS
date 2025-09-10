package com.ats.service;

import com.ats.model.User;
import com.ats.model.UserRole;
import com.ats.repository.UserRepository;
import com.ats.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleMigrationService implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting role migration service...");
        migrateUsersToMultiRole();
        log.info("Role migration service completed.");
    }
    
    /**
     * Migrate all users to the new multi-role system
     * This ensures that users who don't have entries in user_roles table get them
     */
    @Transactional
    public void migrateUsersToMultiRole() {
        List<User> users = userRepository.findAll();
        int migratedCount = 0;
        
        for (User user : users) {
            if (migrateUserToMultiRole(user)) {
                migratedCount++;
            }
        }
        
        log.info("Migrated {} users to multi-role system", migratedCount);
    }
    
    /**
     * Migrate a single user to multi-role system
     */
    @Transactional
    public boolean migrateUserToMultiRole(User user) {
        // Check if user already has roles in user_roles table
        if (!userRoleRepository.findByUserId(user.getId()).isEmpty()) {
            log.debug("User {} already has roles in user_roles table, skipping", user.getEmail());
            return false;
        }
        
        // Create UserRole entry for existing role
        if (user.getRole() != null) {
            UserRole userRole = UserRole.builder()
                .user(user)
                .role(user.getRole())
                .isPrimary(true)
                .assignedAt(LocalDateTime.now())
                .build();
            
            userRoleRepository.save(userRole);
            log.debug("Migrated user {} with role {}", user.getEmail(), user.getRole());
            return true;
        }
        
        log.warn("User {} has no role, skipping migration", user.getEmail());
        return false;
    }
    
    /**
     * Migrate a specific user by ID
     */
    @Transactional
    public boolean migrateUserToMultiRole(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        return migrateUserToMultiRole(user);
    }
}
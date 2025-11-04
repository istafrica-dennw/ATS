package com.ats.service;

import com.ats.model.User;
import com.ats.model.SubscriptionLog;
import com.ats.repository.UserRepository;
import com.ats.repository.SubscriptionLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SubscriptionService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SubscriptionLogRepository subscriptionLogRepository;
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Subscribe a user to job notifications
     */
    @Transactional
    public User subscribeUser(Long userId, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setIsSubscribed(true);
        user.setSubscribedAt(LocalDateTime.now());
        user.setUnsubscribedAt(null);
        
        // Set default preferences if not set
        if (user.getSubscriptionPreferences() == null || user.getSubscriptionPreferences().isEmpty()) {
            Map<String, Boolean> defaultPrefs = new HashMap<>();
            defaultPrefs.put("jobNotifications", true);
            defaultPrefs.put("bulkEmails", true);
            try {
                // Convert to JSON string - PostgreSQL will cast it to JSONB
                String prefsJson = objectMapper.writeValueAsString(defaultPrefs);
                user.setSubscriptionPreferences(prefsJson);
            } catch (Exception e) {
                throw new RuntimeException("Error setting subscription preferences", e);
            }
        }
        
        user = userRepository.save(user);
        
        // Log subscription
        logSubscriptionAction(user, "SUBSCRIBED", ipAddress, userAgent);
        
        return user;
    }
    
    /**
     * Unsubscribe a user from job notifications
     */
    @Transactional
    public User unsubscribeUser(Long userId, String ipAddress, String userAgent) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setIsSubscribed(false);
        user.setUnsubscribedAt(LocalDateTime.now());
        
        user = userRepository.save(user);
        
        // Log unsubscription
        logSubscriptionAction(user, "UNSUBSCRIBED", ipAddress, userAgent);
        
        return user;
    }
    
    /**
     * Get subscription status for a user
     */
    @Transactional(readOnly = true)
    public boolean isUserSubscribed(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            return Boolean.TRUE.equals(userOpt.get().getIsSubscribed());
        }
        return false;
    }
    
    /**
     * Get all subscribed users
     */
    @Transactional(readOnly = true)
    public List<User> getAllSubscribedUsers() {
        return userRepository.findAll().stream()
            .filter(user -> Boolean.TRUE.equals(user.getIsSubscribed()))
            .filter(user -> user.getIsActive() == null || Boolean.TRUE.equals(user.getIsActive()))
            .toList();
    }
    
    /**
     * Get subscription preferences for a user
     */
    @Transactional(readOnly = true)
    public Map<String, Boolean> getSubscriptionPreferences(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        if (user.getSubscriptionPreferences() == null || user.getSubscriptionPreferences().isEmpty()) {
            Map<String, Boolean> defaultPrefs = new HashMap<>();
            defaultPrefs.put("jobNotifications", true);
            defaultPrefs.put("bulkEmails", true);
            return defaultPrefs;
        }
        
        try {
            return objectMapper.readValue(user.getSubscriptionPreferences(), 
                new TypeReference<Map<String, Boolean>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Error reading subscription preferences", e);
        }
    }
    
    /**
     * Update subscription preferences for a user
     */
    @Transactional
    public User updateSubscriptionPreferences(Long userId, Map<String, Boolean> preferences) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        try {
            user.setSubscriptionPreferences(objectMapper.writeValueAsString(preferences));
            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Error updating subscription preferences", e);
        }
    }
    
    /**
     * Log subscription action
     */
    private void logSubscriptionAction(User user, String action, String ipAddress, String userAgent) {
        SubscriptionLog log = SubscriptionLog.builder()
            .user(user)
            .action(action)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .build();
        subscriptionLogRepository.save(log);
    }
}


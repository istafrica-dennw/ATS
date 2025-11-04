package com.ats.controller;

import com.ats.dto.SubscriptionDTO;
import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.ats.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    
    @Autowired
    private SubscriptionService subscriptionService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Subscribe the current user
     */
    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, Object>> subscribe(Authentication authentication, HttpServletRequest request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        
        User updatedUser = subscriptionService.subscribeUser(user.getId(), ipAddress, userAgent);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("isSubscribed", updatedUser.getIsSubscribed());
        response.put("message", "Successfully subscribed to job notifications");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Unsubscribe the current user
     */
    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, Object>> unsubscribe(Authentication authentication, HttpServletRequest request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        
        User updatedUser = subscriptionService.unsubscribeUser(user.getId(), ipAddress, userAgent);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("isSubscribed", updatedUser.getIsSubscribed());
        response.put("message", "Successfully unsubscribed from job notifications");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get subscription status for the current user
     */
    @GetMapping("/status")
    public ResponseEntity<SubscriptionDTO> getSubscriptionStatus(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isSubscribed = subscriptionService.isUserSubscribed(user.getId());
        Map<String, Boolean> preferences = subscriptionService.getSubscriptionPreferences(user.getId());
        
        SubscriptionDTO dto = SubscriptionDTO.builder()
            .isSubscribed(isSubscribed)
            .preferences(preferences)
            .build();
        
        return ResponseEntity.ok(dto);
    }
    
    /**
     * Update subscription preferences for the current user
     */
    @PutMapping("/preferences")
    public ResponseEntity<Map<String, Object>> updatePreferences(
            Authentication authentication,
            @RequestBody Map<String, Boolean> preferences) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        subscriptionService.updateSubscriptionPreferences(user.getId(), preferences);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Subscription preferences updated successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all subscribed users (admin only)
     */
    @GetMapping("/subscribed-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSubscribedUsers() {
        List<User> subscribedUsers = subscriptionService.getAllSubscribedUsers();
        
        Map<String, Object> response = new HashMap<>();
        response.put("count", subscribedUsers.size());
        response.put("users", subscribedUsers.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            userMap.put("subscribedAt", user.getSubscribedAt());
            return userMap;
        }).toList());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}


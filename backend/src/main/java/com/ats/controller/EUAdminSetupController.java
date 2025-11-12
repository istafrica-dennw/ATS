package com.ats.controller;

import com.ats.dto.UserDTO;
import com.ats.model.User;
import com.ats.service.EUAdminSetupService;
import com.ats.service.GeolocationService;
import com.ats.service.UserService;
import com.ats.util.IPUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for EU admin setup functionality
 */
@RestController
@RequestMapping("/api/eu-admin-setup")
@Tag(name = "EU Admin Setup", description = "APIs for EU admin setup and management")
public class EUAdminSetupController {
    
    private static final Logger logger = LoggerFactory.getLogger(EUAdminSetupController.class);
    private final EUAdminSetupService euAdminSetupService;
    private final GeolocationService geolocationService;
    private final UserService userService;
    
    @Autowired
    public EUAdminSetupController(EUAdminSetupService euAdminSetupService, GeolocationService geolocationService, UserService userService) {
        this.euAdminSetupService = euAdminSetupService;
        this.geolocationService = geolocationService;
        this.userService = userService;
    }
    
    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Check EU admin setup status",
        description = "Returns information about EU admin setup status and current user's eligibility"
    )
    public ResponseEntity<Map<String, Object>> getSetupStatus(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = getUserByEmail(userEmail);
            
            String clientIP = IPUtils.getClientIPAddress();
            
            if (clientIP == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Unable to determine IP address");
                return ResponseEntity.ok(response);
            }
            
            boolean isEUAccess = geolocationService.isEUAccess(clientIP);
            boolean hasEUAdmin = euAdminSetupService.hasEUAdmin();
            boolean canBecomeFirstEUAdmin = euAdminSetupService.canBecomeFirstEUAdmin(currentUser, isEUAccess);
            boolean canAssignEURegion = euAdminSetupService.canAssignEURegion(currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasEUAdmin", hasEUAdmin);
            response.put("canBecomeFirstEUAdmin", canBecomeFirstEUAdmin);
            response.put("canAssignEURegion", canAssignEURegion);
            response.put("isEUAccess", isEUAccess);
            response.put("clientIP", clientIP);
            response.put("currentUserRegion", currentUser.getRegion());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Failed to get setup status: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    @PostMapping("/become-first-eu-admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Become the first EU admin",
        description = "Sets the current user as the first EU admin. Can only be done once and requires EU access."
    )
    public ResponseEntity<Map<String, Object>> becomeFirstEUAdmin(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = getUserByEmail(userEmail);
            
            String clientIP = IPUtils.getClientIPAddress();
            
            if (clientIP == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Unable to determine IP address");
                return ResponseEntity.badRequest().body(response);
            }
            
            boolean isEUAccess = geolocationService.isEUAccess(clientIP);
            
            if (!isEUAccess) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You must be accessing from EU to become EU admin");
                return ResponseEntity.badRequest().body(response);
            }
            
            User updatedUser = euAdminSetupService.setFirstEUAdmin(currentUser.getId(), isEUAccess);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully became the first EU admin");
            response.put("user", updatedUser);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to become EU admin: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    @PostMapping("/assign-eu-region/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Assign EU region to a user",
        description = "Assigns EU region to a user. Only EU admins can perform this action."
    )
    public ResponseEntity<Map<String, Object>> assignEURegion(
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = getUserByEmail(userEmail);
            
            if (!euAdminSetupService.canAssignEURegion(currentUser)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Only EU admins can assign EU region to users");
                return ResponseEntity.badRequest().body(response);
            }
            
            // This would be implemented in UserService
            // For now, return a placeholder response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "EU region assignment functionality will be implemented in UserService");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to assign EU region: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    private User getUserByEmail(String email) {
        UserDTO userDTO = userService.getUserByEmail(email);
        // Convert UserDTO to User entity
        User user = new User();
        user.setId(userDTO.getId());
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setRole(userDTO.getRole());
        user.setRegion(userDTO.getRegion());
        return user;
    }
}
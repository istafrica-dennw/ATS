package com.ats.controller;

import com.ats.dto.AssignRolesRequest;
import com.ats.dto.RoleDTO;
import com.ats.dto.SwitchRoleRequest;
import com.ats.dto.UserDTO;
import com.ats.model.Role;
import com.ats.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.ats.util.SecurityUtils;
import org.springframework.security.core.Authentication;
import com.ats.model.User;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {
    
    private final RoleService roleService;
    private final SecurityUtils securityUtils;
    
    /**
     * Get all available roles for the current user
     */
    @GetMapping("/available")
    public ResponseEntity<List<RoleDTO>> getAvailableRoles(Authentication authentication) {
        log.debug("Getting available roles for current user");
        
        // Use securityUtils to get the user (Handles both IAA and Local)
        User user = securityUtils.getCurrentUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        // Pass the user ID to the service so it doesn't have to "guess" who it is
        List<RoleDTO> roles = roleService.getAvailableRoles(user.getId());
        return ResponseEntity.ok(roles);
    }
    
    /**
     * Get all available roles for a specific user (Admin only)
     */
    @GetMapping("/available/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoleDTO>> getAvailableRoles(@PathVariable Long userId) {
        log.debug("Getting available roles for user ID: {}", userId);
        List<RoleDTO> roles = roleService.getAvailableRoles(userId);
        return ResponseEntity.ok(roles);
    }
    
    /**
     * Get current active role for the current user
     */
    @GetMapping("/current")
    public ResponseEntity<RoleDTO> getCurrentRole(Authentication authentication) {
        log.debug("Getting current role for current user");
        
        User user = securityUtils.getCurrentUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        // Pass the user object or ID to the service
        RoleDTO currentRole = roleService.getCurrentRole(user); 
        return ResponseEntity.ok(currentRole);
    }
    
    /**
     * Switch to a different role
     */
    @PostMapping("/switch")
    public ResponseEntity<UserDTO> switchRole(@Valid @RequestBody SwitchRoleRequest request) {
        log.debug("Switching role to: {}", request.getRole());
        UserDTO user = roleService.switchRole(request);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Assign roles to a user (Admin only)
     */
    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> assignRoles(@Valid @RequestBody AssignRolesRequest request) {
        log.debug("Assigning roles {} to user ID: {}", request.getRoles(), request.getUserId());
        UserDTO user = roleService.assignRoles(request);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Remove a role from a user (Admin only)
     */
    @DeleteMapping("/{userId}/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> removeRole(@PathVariable Long userId, @PathVariable Role role) {
        log.debug("Removing role {} from user ID: {}", role, userId);
        UserDTO user = roleService.removeRole(userId, role);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Get all users with a specific role (Admin only)
     */
    @GetMapping("/users/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable Role role) {
        log.debug("Getting users with role: {}", role);
        List<UserDTO> users = roleService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Check if user has a specific role (Admin only)
     */
    @GetMapping("/{userId}/has-role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Boolean> userHasRole(@PathVariable Long userId, @PathVariable Role role) {
        log.debug("Checking if user ID {} has role: {}", userId, role);
        boolean hasRole = roleService.userHasRole(userId, role);
        return ResponseEntity.ok(hasRole);
    }
    
    /**
     * Get role hierarchy
     */
    @GetMapping("/hierarchy")
    public ResponseEntity<List<Role>> getRoleHierarchy() {
        log.debug("Getting role hierarchy");
        List<Role> hierarchy = roleService.getRoleHierarchy();
        return ResponseEntity.ok(hierarchy);
    }
}
package com.ats.service;

import com.ats.dto.AssignRolesRequest;
import com.ats.dto.RoleDTO;
import com.ats.dto.SwitchRoleRequest;
import com.ats.dto.UserDTO;
import com.ats.model.Role;

import java.util.List;

public interface RoleService {
    
    /**
     * Get all available roles for the current user
     */
    List<RoleDTO> getAvailableRoles();
    
    /**
     * Get all available roles for a specific user
     */
    List<RoleDTO> getAvailableRoles(Long userId);
    
    /**
     * Get current active role for the current user
     */
    RoleDTO getCurrentRole();
    
    /**
     * Switch to a different role
     */
    UserDTO switchRole(SwitchRoleRequest request);
    
    /**
     * Assign roles to a user (Admin only)
     */
    UserDTO assignRoles(AssignRolesRequest request);
    
    /**
     * Remove a role from a user (Admin only)
     */
    UserDTO removeRole(Long userId, Role role);
    
    /**
     * Get all users with a specific role
     */
    List<UserDTO> getUsersByRole(Role role);
    
    /**
     * Check if user has a specific role
     */
    boolean userHasRole(Long userId, Role role);
    
    /**
     * Get role hierarchy for determining default role
     */
    List<Role> getRoleHierarchy();
    
    /**
     * Get the highest role from a list of roles
     */
    Role getHighestRole(List<Role> roles);
}
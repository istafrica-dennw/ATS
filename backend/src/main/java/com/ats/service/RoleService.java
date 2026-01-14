package com.ats.service;

import com.ats.dto.*;
import com.ats.model.Role;
import com.ats.model.User; // <--- IMPORTANT IMPORT
import java.util.List;

public interface RoleService {
    // These MUST be here so the implementation can "Override" them
    RoleDTO getCurrentRole(User user); 
    List<RoleDTO> getAvailableRoles(Long userId);
    
    // Existing methods (ensure they match your implementation exactly)
    List<RoleDTO> getAvailableRoles();
    RoleDTO getCurrentRole();
    UserDTO switchRole(SwitchRoleRequest request);
    UserDTO assignRoles(AssignRolesRequest request);
    UserDTO removeRole(Long userId, Role role);
    List<UserDTO> getUsersByRole(Role role);
    boolean userHasRole(Long userId, Role role);
    List<Role> getRoleHierarchy();
    Role getHighestRole(List<Role> roles);
}
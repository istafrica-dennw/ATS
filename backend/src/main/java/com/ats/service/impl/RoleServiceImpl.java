package com.ats.service.impl;

import com.ats.dto.AssignRolesRequest;
import com.ats.dto.RoleDTO;
import com.ats.dto.SwitchRoleRequest;
import com.ats.dto.UserDTO;
import com.ats.model.Role;
import com.ats.model.User;
import com.ats.model.UserRole;
import com.ats.model.UserRoleSession;
import com.ats.repository.UserRepository;
import com.ats.repository.UserRoleRepository;
import com.ats.repository.UserRoleSessionRepository;
import com.ats.service.RoleService;
import com.ats.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoleServiceImpl implements RoleService {
    
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserRoleSessionRepository userRoleSessionRepository;
    private final UserService userService;
    
    // Role hierarchy (highest to lowest)
    private static final List<Role> ROLE_HIERARCHY = Arrays.asList(
        Role.ADMIN,
        Role.HIRING_MANAGER,
        Role.INTERVIEWER,
        Role.CANDIDATE
    );
    
    @Override
    @Transactional(readOnly = true)
    public List<RoleDTO> getAvailableRoles() {
        User currentUser = getCurrentUser();
        return getAvailableRoles(currentUser.getId());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RoleDTO> getAvailableRoles(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        Role currentRole = user.getRole();
        
        return userRoles.stream()
            .map(userRole -> RoleDTO.builder()
                .role(userRole.getRole())
                .displayName(RoleDTO.getDisplayName(userRole.getRole()))
                .isPrimary(userRole.getIsPrimary())
                .isCurrent(userRole.getRole().equals(currentRole))
                .build())
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public RoleDTO getCurrentRole() {
        User currentUser = getCurrentUser();
        return RoleDTO.builder()
            .role(currentUser.getRole())
            .displayName(RoleDTO.getDisplayName(currentUser.getRole()))
            .isCurrent(true)
            .build();
    }
    
    @Override
    public UserDTO switchRole(SwitchRoleRequest request) {
        User currentUser = getCurrentUser();
        Role requestedRole = request.getRole();
        
        // Validate that user has the requested role
        if (!userRoleRepository.existsByUserIdAndRole(currentUser.getId(), requestedRole)) {
            throw new IllegalArgumentException("User does not have the role: " + requestedRole);
        }
        
        // Update current role
        currentUser.setRole(requestedRole);
        userRepository.save(currentUser);
        
        // Create or update role session
        createOrUpdateRoleSession(currentUser, requestedRole);
        
        log.info("User {} switched to role {}", currentUser.getEmail(), requestedRole);
        
        return userService.convertToDTO(currentUser);
    }
    
    @Override
    public UserDTO assignRoles(AssignRolesRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + request.getUserId()));
        
        User currentUser = getCurrentUser();
        
        // Get existing roles
        List<UserRole> existingRoles = userRoleRepository.findByUserId(request.getUserId());
        Set<Role> existingRoleSet = existingRoles.stream()
            .map(UserRole::getRole)
            .collect(Collectors.toSet());
        
        // Determine which roles to add and remove
        Set<Role> requestedRoles = new HashSet<>(request.getRoles());
        Set<Role> rolesToAdd = new HashSet<>(requestedRoles);
        rolesToAdd.removeAll(existingRoleSet);
        
        Set<Role> rolesToRemove = new HashSet<>(existingRoleSet);
        rolesToRemove.removeAll(requestedRoles);
        
        // Remove roles that are no longer needed
        for (Role role : rolesToRemove) {
            userRoleRepository.deleteByUserIdAndRole(request.getUserId(), role);
        }
        
        // Add new roles
        List<UserRole> newRoles = new ArrayList<>();
        for (Role role : rolesToAdd) {
            UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .isPrimary(role.equals(request.getPrimaryRole()))
                .assignedAt(LocalDateTime.now())
                .assignedBy(currentUser)
                .build();
            newRoles.add(userRole);
        }
        
        if (!newRoles.isEmpty()) {
            userRoleRepository.saveAll(newRoles);
        }
        
        // Update primary role for existing roles
        if (request.getPrimaryRole() != null) {
            // Remove primary flag from all existing roles
            for (UserRole existingRole : existingRoles) {
                if (existingRole.getRole().equals(request.getPrimaryRole())) {
                    existingRole.setIsPrimary(true);
                    userRoleRepository.save(existingRole);
                } else {
                    existingRole.setIsPrimary(false);
                    userRoleRepository.save(existingRole);
                }
            }
            
            // Set primary flag for new roles
            for (UserRole newRole : newRoles) {
                if (newRole.getRole().equals(request.getPrimaryRole())) {
                    newRole.setIsPrimary(true);
                    userRoleRepository.save(newRole);
                }
            }
        }
        
        // Set primary role as current role if not specified
        Role primaryRole = request.getPrimaryRole();
        if (primaryRole == null) {
            primaryRole = getHighestRole(request.getRoles());
        }
        
        user.setRole(primaryRole);
        userRepository.save(user);
        
        log.info("Assigned roles {} to user {} by {}", request.getRoles(), user.getEmail(), currentUser.getEmail());
        
        return userService.convertToDTO(user);
    }
    
    @Override
    public UserDTO removeRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        // Check if user has this role
        if (!userRoleRepository.existsByUserIdAndRole(userId, role)) {
            throw new IllegalArgumentException("User does not have the role: " + role);
        }
        
        // Remove the role
        userRoleRepository.deleteByUserIdAndRole(userId, role);
        
        // If this was the current role, switch to primary role
        if (user.getRole().equals(role)) {
            Optional<UserRole> primaryRole = userRoleRepository.findByUserIdAndIsPrimaryTrue(userId);
            if (primaryRole.isPresent()) {
                user.setRole(primaryRole.get().getRole());
                userRepository.save(user);
            } else {
                // If no primary role, set to highest available role
                List<UserRole> remainingRoles = userRoleRepository.findByUserId(userId);
                if (!remainingRoles.isEmpty()) {
                    Role highestRole = getHighestRole(remainingRoles.stream()
                        .map(UserRole::getRole)
                        .collect(Collectors.toList()));
                    user.setRole(highestRole);
                    userRepository.save(user);
                }
            }
        }
        
        log.info("Removed role {} from user {}", role, user.getEmail());
        
        return userService.convertToDTO(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(Role role) {
        List<User> users = userRoleRepository.findUsersByRole(role);
        return users.stream()
            .map(userService::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean userHasRole(Long userId, Role role) {
        return userRoleRepository.existsByUserIdAndRole(userId, role);
    }
    
    @Override
    public List<Role> getRoleHierarchy() {
        return new ArrayList<>(ROLE_HIERARCHY);
    }
    
    @Override
    public Role getHighestRole(List<Role> roles) {
        return roles.stream()
            .min(Comparator.comparingInt(ROLE_HIERARCHY::indexOf))
            .orElse(Role.CANDIDATE);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }
        
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }
    
    private void createOrUpdateRoleSession(User user, Role role) {
        // Delete existing sessions for this user
        userRoleSessionRepository.deleteByUserId(user.getId());
        
        // Create new session
        UserRoleSession session = UserRoleSession.builder()
            .user(user)
            .currentRole(role)
            .sessionToken(UUID.randomUUID().toString())
            .createdAt(LocalDateTime.now())
            .expiresAt(LocalDateTime.now().plusHours(24)) // 24 hour session
            .build();
        
        userRoleSessionRepository.save(session);
    }
}
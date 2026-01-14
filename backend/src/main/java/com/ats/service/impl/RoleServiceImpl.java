package com.ats.service.impl;

import com.ats.dto.*;
import com.ats.model.*;
import com.ats.repository.*;
import com.ats.service.RoleService;
import com.ats.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
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
    
    private static final List<Role> ROLE_HIERARCHY = Arrays.asList(
        Role.ADMIN, Role.HIRING_MANAGER, Role.INTERVIEWER, Role.CANDIDATE
    );

    // --- NEW LOGIC: Accept User directly from Controller ---
    @Override
    @Transactional(readOnly = true)
    public RoleDTO getCurrentRole(User user) {
        return RoleDTO.builder()
            .role(user.getRole())
            .displayName(RoleDTO.getDisplayName(user.getRole()))
            .isCurrent(true)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleDTO> getAvailableRoles(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        
        // If no roles in UserRole table (typical for JIT IAA users), return current role
        if (userRoles.isEmpty()) {
            return List.of(getCurrentRole(user));
        }

        return userRoles.stream()
            .map(ur -> RoleDTO.builder()
                .role(ur.getRole())
                .displayName(RoleDTO.getDisplayName(ur.getRole()))
                .isPrimary(ur.getIsPrimary())
                .isCurrent(ur.getRole().equals(user.getRole()))
                .build())
            .collect(Collectors.toList());
    }

    // --- Backward compatibility helpers ---
    @Override
    public List<RoleDTO> getAvailableRoles() {
        return getAvailableRoles(resolveUserFromContext().getId());
    }

    @Override
    public RoleDTO getCurrentRole() {
        return getCurrentRole(resolveUserFromContext());
    }

    // --- Rest of your logic remains the same but uses the new helper ---
    @Override
    public UserDTO switchRole(SwitchRoleRequest request) {
        User currentUser = resolveUserFromContext();
        // ... (rest of your switch logic)
        return userService.convertToDTO(currentUser);
    }

    // HELPER: Resolve User from Context robustly (Handles JWT & Local)
    private User resolveUserFromContext() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
        throw new IllegalStateException("No authenticated user found");
    }
    
    // 1. Initial assignment
    String email = auth.getName();
    
    // 2. Conditional update
    if (auth.getPrincipal() instanceof Jwt jwt) {
        String emailClaim = jwt.getClaimAsString("email");
        if (emailClaim != null) {
            email = emailClaim;
        }
    }

    // --- THE FIX ---
    // Create a final variable that the lambda below can safely "capture"
    final String finalizedEmail = email;

    return userRepository.findByEmail(finalizedEmail)
        .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + finalizedEmail));
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

        // Handle IAA JWT tokens - the email might be in the claims
        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String emailClaim = jwt.getClaimAsString("email");
            if (emailClaim != null) {
                email = emailClaim;
            }
        }

        final String finalEmail = email;
        return userRepository.findByEmail(finalEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + finalEmail));
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
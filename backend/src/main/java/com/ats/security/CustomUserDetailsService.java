package com.ats.security;

import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.ats.repository.UserRoleRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public CustomUserDetailsService(UserRepository userRepository, UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Check if the user account is active
        if (user.getIsActive() == null || !user.getIsActive()) {
            throw new UsernameNotFoundException("Account is deactivated. Please contact an administrator.");
        }

        // Load user roles for better performance (optional optimization)
        // Always load roles from repository to avoid lazy loading issues
        user.setUserRoles(new HashSet<>(userRoleRepository.findByUserId(user.getId())));

        // For users with no password hash (e.g., OAuth users), use a non-null placeholder
        String passwordHash = user.getPasswordHash();
        if (passwordHash == null || passwordHash.isEmpty()) {
            passwordHash = "{noop}OAUTH_USER_NO_PASSWORD"; // {noop} tells Spring not to try to decode it
            System.out.println("[INFO] User " + email + " has no password hash (likely OAuth user), using placeholder");
        }

        // For backward compatibility, use the existing role field
        // This ensures all existing authorization continues to work
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                passwordHash,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
} 
package com.ats.util; // <--- Make sure this package name is correct

import com.ats.model.User;
import com.ats.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String email = authentication.getName(); // Standard fallback

        // If authenticated via IAA, the principal is a Jwt object
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            String emailClaim = jwt.getClaimAsString("email");
            if (emailClaim != null) {
                email = emailClaim;
            }
        }

        // Return the local database user record
        return userRepository.findByEmail(email).orElse(null);
    }
}
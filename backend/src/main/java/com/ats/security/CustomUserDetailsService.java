package com.ats.security;

import com.ats.model.User;
import com.ats.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // For users with no password hash (e.g., OAuth users), use a non-null placeholder
        String passwordHash = user.getPasswordHash();
        if (passwordHash == null || passwordHash.isEmpty()) {
            passwordHash = "{noop}OAUTH_USER_NO_PASSWORD"; // {noop} tells Spring not to try to decode it
            System.out.println("[INFO] User " + email + " has no password hash (likely OAuth user), using placeholder");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                passwordHash,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
} 
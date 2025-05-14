package com.ats.security;

import com.ats.model.User;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.Collections;

@Component
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    
    @Autowired
    public CustomOAuth2AuthenticationSuccessHandler(
            UserRepository userRepository,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        
        System.out.println("[DEBUG] OAuth2 Authentication Success Handler called");
        
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            System.out.println("[DEBUG] Processing OAuth2 authentication token");
            
            if (oauthToken.getPrincipal() instanceof OidcUser) {
                OidcUser oidcUser = (OidcUser) oauthToken.getPrincipal();
                System.out.println("[DEBUG] Processing OIDC user");
                
                // Save or update the user in the database
                User user = saveOrUpdateUser(oidcUser, oauthToken.getAuthorizedClientRegistrationId());
                
                if (user != null) {
                    // Explicitly set the proper role for the JWT token
                    String email = oidcUser.getEmail();
                    // Ensure we're using ROLE_CANDIDATE format
                    String roleString = "ROLE_" + Role.CANDIDATE.name();
                    
                    System.out.println("[DEBUG] Generating JWT with email: " + email + " and role: " + roleString);
                    
                    // Generate JWT with proper role
                    String jwt = tokenProvider.generateTokenForUsernameAndRoles(email, roleString);
                    
                    System.out.println("[DEBUG] Generated JWT for LinkedIn user with proper role");
                    
                    // Redirect to frontend with token
                    String targetUrl = frontendUrl + "/dashboard?token=" + jwt;
                    System.out.println("[DEBUG] Redirecting to frontend with proper token: " + targetUrl);
                    getRedirectStrategy().sendRedirect(request, response, targetUrl);
                    return;
                }
            }
        }
        
        // Fallback to standard token generation if not OAuth2 or user not found
        String jwt = tokenProvider.generateToken(authentication);
        System.out.println("[DEBUG] Generated JWT token using standard method: " + jwt);
        
        // Always redirect to frontend dashboard with the JWT token
        String targetUrl = frontendUrl + "/dashboard?token=" + jwt;
        System.out.println("[DEBUG] Redirecting to frontend with token: " + targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
    
    private User saveOrUpdateUser(OidcUser oidcUser, String provider) {
        System.out.println("[DEBUG] Saving or updating user from OAuth2 provider: " + provider);
        
        String email = oidcUser.getEmail();
        String sub = oidcUser.getSubject();
        
        if (email == null || sub == null) {
            System.out.println("[DEBUG] Email or subject is null, cannot save user");
            return null;
        }
        
        try {
            // Try to find user by provider ID
            Optional<User> existingUserByProviderId = null;
            if ("linkedin".equals(provider)) {
                existingUserByProviderId = userRepository.findByLinkedinId(sub);
            }
            
            // If not found by provider ID, try by email
            if (existingUserByProviderId == null || existingUserByProviderId.isEmpty()) {
                System.out.println("[DEBUG] User not found by provider ID, checking by email: " + email);
                Optional<User> existingUserByEmail = userRepository.findByEmail(email);
                
                if (existingUserByEmail.isPresent()) {
                    // User exists by email, update provider ID
                    User user = existingUserByEmail.get();
                    System.out.println("[DEBUG] User found by email, updating provider data: " + user.getId());
                    
                    // Update provider-specific fields
                    if ("linkedin".equals(provider)) {
                        user.setLinkedinId(sub);
                        System.out.println("[DEBUG] Updated LinkedIn ID: " + sub);
                    }
                    
                    // Update other fields
                    updateUserFields(user, oidcUser);
                    
                    userRepository.save(user);
                    System.out.println("[DEBUG] User updated: " + user.getId());
                    return user;
                } else {
                    // No existing user, create new one - using the same pattern as email/password signup
                    System.out.println("[DEBUG] User not found, creating new user with email: " + email);
                    User newUser = new User();
                    newUser.setEmail(email);
                    
                    // Required fields from User entity - ALWAYS set CANDIDATE role
                    newUser.setFirstName(oidcUser.getGivenName() != null ? oidcUser.getGivenName() : "LinkedIn");
                    newUser.setLastName(oidcUser.getFamilyName() != null ? oidcUser.getFamilyName() : "User");
                    newUser.setRole(Role.CANDIDATE); // IMPORTANT: setting proper role from enum
                    newUser.setIsActive(true);
                    newUser.setIsEmailVerified(true); // LinkedIn users are already verified
                    
                    // LinkedIn specific fields
                    if ("linkedin".equals(provider)) {
                        newUser.setLinkedinId(sub);
                        newUser.setLinkedinProfileUrl("https://www.linkedin.com/in/" + sub);
                        if (oidcUser.getPicture() != null) {
                            newUser.setProfilePictureUrl(oidcUser.getPicture());
                        }
                    }
                    
                    // Save the user
                    userRepository.save(newUser);
                    System.out.println("[DEBUG] New user created with email: " + email + " and role: " + newUser.getRole());
                    return newUser;
                }
            } else {
                // User exists by provider ID, update other fields
                User user = existingUserByProviderId.get();
                System.out.println("[DEBUG] User found by provider ID, updating: " + user.getId());
                
                // Update user information
                updateUserFields(user, oidcUser);
                
                userRepository.save(user);
                System.out.println("[DEBUG] User updated: " + user.getId());
                return user;
            }
        } catch (Exception e) {
            System.out.println("[DEBUG] Error saving/updating user: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private void updateUserFields(User user, OidcUser oidcUser) {
        // First name
        if (oidcUser.getGivenName() != null) {
            user.setFirstName(oidcUser.getGivenName());
        }
        
        // Last name
        if (oidcUser.getFamilyName() != null) {
            user.setLastName(oidcUser.getFamilyName());
        }
        
        // Profile picture
        if (oidcUser.getPicture() != null) {
            user.setProfilePictureUrl(oidcUser.getPicture());
        }
        
        // Email
        if (oidcUser.getEmail() != null) {
            user.setEmail(oidcUser.getEmail());
        }
        
        // Always ensure the role is set to CANDIDATE for LinkedIn users
        user.setRole(Role.CANDIDATE);
        
        // Email verification - LinkedIn users are considered verified
        user.setIsEmailVerified(true);
    }
} 
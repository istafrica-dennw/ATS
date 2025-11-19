package com.ats.security;

import com.ats.model.User;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Component
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2AuthenticationSuccessHandler.class);
    
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
        
        logger.debug("OAuth2 Authentication Success Handler called");
        
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            logger.debug("Processing OAuth2 authentication token");
            
            if (oauthToken.getPrincipal() instanceof OidcUser) {
                OidcUser oidcUser = (OidcUser) oauthToken.getPrincipal();
                logger.debug("Processing OIDC user");
                
                // Save or update the user in the database
                User user = saveOrUpdateUser(oidcUser, oauthToken.getAuthorizedClientRegistrationId());
                
                if (user != null) {
                    // Check if user account is active
                    if (user.getIsActive() == null || !user.getIsActive()) {
                        logger.warn("User account is deactivated: {}", user.getEmail());
                        response.sendRedirect(frontendUrl + "/login?error=account_deactivated");
                        return;
                    }
                    
                    // Use the user's actual role from the database (preserves admin-assigned roles)
                    String email = oidcUser.getEmail();
                    String roleString = "ROLE_" + user.getRole().name();
                    
                    logger.debug("Generating JWT with email: {} and role: {}", email, roleString);
                    
                    // Generate JWT with proper role
                    String jwt = tokenProvider.generateTokenForUsernameAndRoles(email, roleString);
                    
                    logger.debug("Generated JWT for LinkedIn user with proper role");
                    
                    // Redirect to frontend with token
                    String targetUrl = frontendUrl + "/dashboard?token=" + jwt;
                    logger.debug("Redirecting to frontend with proper token: {}", targetUrl);
                    getRedirectStrategy().sendRedirect(request, response, targetUrl);
                    return;
                }
            }
        }
        
        // Fallback to standard token generation if not OAuth2 or user not found
        String jwt = tokenProvider.generateToken(authentication);
        logger.debug("Generated JWT token using standard method: {}", jwt);
        
        // Always redirect to frontend dashboard with the JWT token
        String targetUrl = frontendUrl + "/dashboard?token=" + jwt;
        logger.debug("Redirecting to frontend with token: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
    
    private User saveOrUpdateUser(OidcUser oidcUser, String provider) {
        logger.debug("Saving or updating user from OAuth2 provider: {}", provider);
        
        String email = oidcUser.getEmail();
        String sub = oidcUser.getSubject();
        
        // Fix for LinkedIn OAuth: LinkedIn sometimes returns member URN as email
        if ("linkedin".equals(provider) && email != null && email.startsWith("urn:li:member:")) {
            logger.warn("LinkedIn returned member URN as email: {}, extracting real email from attributes", email);
            // Try to get email from user attributes instead
            Map<String, Object> attributes = oidcUser.getAttributes();
            String realEmail = (String) attributes.get("email");
            if (realEmail != null && !realEmail.startsWith("urn:li:member:")) {
                email = realEmail;
                logger.info("Found real email from attributes: {}", email);
            } else {
                // If no real email found, use a placeholder that can be updated later
                email = "linkedin-user-" + sub + "@placeholder.com";
                logger.warn("No real email found, using placeholder: {}", email);
            }
        }
        
        if (email == null || sub == null) {
            logger.error("Email or subject is null, cannot save user. Email: {}, Subject: {}", email, sub);
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
                logger.debug("User not found by provider ID, checking by email: {}", email);
                Optional<User> existingUserByEmail = userRepository.findByEmail(email);
                
                if (existingUserByEmail.isPresent()) {
                    // User exists by email, update provider ID
                    User user = existingUserByEmail.get();
                    logger.debug("User found by email, updating provider data: {}", user.getId());
                    logger.debug("Current user role: {}", user.getRole());
                    
                    // Update provider-specific fields
                    if ("linkedin".equals(provider)) {
                        user.setLinkedinId(sub);
                        logger.debug("Updated LinkedIn ID: {}", sub);
                    }
                    
                    // Update other fields
                    updateUserFields(user, oidcUser);
                    
                    logger.debug("User role after update: {}", user.getRole());
                    userRepository.save(user);
                    logger.debug("User updated: {}", user.getId());
                    return user;
                } else {
                    // No existing user, create new one - using the same pattern as email/password signup
                    logger.info("User not found, creating new user with email: {}", email);
                    User newUser = new User();
                    newUser.setEmail(email);
                    
                    // Required fields from User entity - ONLY set CANDIDATE role for NEW users
                    newUser.setFirstName(oidcUser.getGivenName() != null ? oidcUser.getGivenName() : "LinkedIn");
                    newUser.setLastName(oidcUser.getFamilyName() != null ? oidcUser.getFamilyName() : "User");
                    newUser.setRole(Role.CANDIDATE); // IMPORTANT: ONLY for new users, existing users keep their roles
                    newUser.setIsActive(true);
                    newUser.setIsEmailVerified(true); // LinkedIn users are already verified                    
                    // Privacy Policy acceptance - by clicking LinkedIn button, user implicitly accepts
                    newUser.setPrivacyPolicyAccepted(true);
                    newUser.setPrivacyPolicyAcceptedAt(LocalDateTime.now());
                    
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
                    logger.info("New user created with email: {} and role: {}", email, newUser.getRole());
                    return newUser;
                }
            } else {
                // User exists by provider ID, update other fields
                User user = existingUserByProviderId.get();
                logger.debug("User found by provider ID, updating: {}", user.getId());
                logger.debug("Current user role: {}", user.getRole());
                
                // Update user information
                updateUserFields(user, oidcUser);
                
                logger.debug("User role after update: {}", user.getRole());
                userRepository.save(user);
                logger.debug("User updated: {}", user.getId());
                return user;
            }
        } catch (Exception e) {
            logger.error("Error saving/updating user: {}", e.getMessage(), e);
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
        
        // Email - handle LinkedIn member URN issue
        String email = oidcUser.getEmail();
        if (email != null && !email.startsWith("urn:li:member:")) {
            user.setEmail(email);
        }
        
        // DO NOT change the role - preserve admin-assigned roles
        // user.setRole(Role.CANDIDATE); // REMOVED: This was overwriting admin roles!
        
        // Email verification - LinkedIn users are considered verified
        user.setIsEmailVerified(true);
    }
} 
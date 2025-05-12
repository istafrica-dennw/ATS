package com.ats.security;

import com.ats.model.User;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
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

@Component
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private static final String FRONTEND_URL = "http://localhost:3001";
    
    private final UserRepository userRepository;
    
    @Autowired
    public CustomOAuth2AuthenticationSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
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
                System.out.println("[DEBUG] ID Token: " + oidcUser.getIdToken().getTokenValue());
                
                // Save or update the user in the database
                saveOrUpdateUser(oidcUser, oauthToken.getAuthorizedClientRegistrationId());
            }
        }
        
        // Get the saved request
        HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
        SavedRequest savedRequest = requestCache.getRequest(request, response);
        
        if (savedRequest != null) {
            String targetUrl = savedRequest.getRedirectUrl();
            System.out.println("[DEBUG] Redirecting to saved request URL: " + targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            // Redirect directly to frontend home page
            String targetUrl = FRONTEND_URL + "/dashboard";
            System.out.println("[DEBUG] Redirecting to frontend dashboard: " + targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }
    
    private void saveOrUpdateUser(OidcUser oidcUser, String provider) {
        System.out.println("[DEBUG] Saving or updating user from OAuth2 provider: " + provider);
        
        String email = oidcUser.getEmail();
        String sub = oidcUser.getSubject();
        
        if (email == null || sub == null) {
            System.out.println("[DEBUG] Email or subject is null, cannot save user");
            return;
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
                        try {
                            // Use reflection to handle potential field missing issues
                            java.lang.reflect.Method setLinkedinId = user.getClass().getMethod("setLinkedinId", String.class);
                            setLinkedinId.invoke(user, sub);
                            System.out.println("[DEBUG] Updated LinkedIn ID: " + sub);
                        } catch (Exception e) {
                            System.out.println("[DEBUG] Could not set LinkedIn ID: " + e.getMessage());
                        }
                    }
                    
                    // Update other fields if they exist
                    updateUserFields(user, oidcUser);
                    
                    userRepository.save(user);
                    System.out.println("[DEBUG] User updated: " + user.getId());
                } else {
                    // No existing user, create new one
                    System.out.println("[DEBUG] User not found, creating new user with email: " + email);
                    User newUser = new User();
                    newUser.setEmail(email);
                    
                    // Set provider-specific fields
                    if ("linkedin".equals(provider)) {
                        try {
                            java.lang.reflect.Method setLinkedinId = newUser.getClass().getMethod("setLinkedinId", String.class);
                            setLinkedinId.invoke(newUser, sub);
                            
                            java.lang.reflect.Method setLinkedinProfileUrl = newUser.getClass().getMethod("setLinkedinProfileUrl", String.class);
                            setLinkedinProfileUrl.invoke(newUser, "https://www.linkedin.com/in/" + sub);
                        } catch (Exception e) {
                            System.out.println("[DEBUG] Could not set LinkedIn fields: " + e.getMessage());
                        }
                    }
                    
                    // Set other common fields
                    updateUserFields(newUser, oidcUser);
                    
                    // Set other fields based on your User model
                    try {
                        java.lang.reflect.Method setRole = newUser.getClass().getMethod("setRole", Role.class);
                        setRole.invoke(newUser, Role.CANDIDATE);
                    } catch (Exception e) {
                        System.out.println("[DEBUG] Could not set role: " + e.getMessage());
                    }
                    
                    try {
                        java.lang.reflect.Method setIsActive = newUser.getClass().getMethod("setIsActive", Boolean.class);
                        setIsActive.invoke(newUser, true);
                    } catch (Exception e) {
                        System.out.println("[DEBUG] Could not set active status: " + e.getMessage());
                    }
                    
                    userRepository.save(newUser);
                    System.out.println("[DEBUG] New user created with email: " + email);
                }
            } else {
                // User exists by provider ID, update other fields
                User user = existingUserByProviderId.get();
                System.out.println("[DEBUG] User found by provider ID, updating: " + user.getId());
                
                // Update user information
                updateUserFields(user, oidcUser);
                
                userRepository.save(user);
                System.out.println("[DEBUG] User updated: " + user.getId());
            }
        } catch (Exception e) {
            System.out.println("[DEBUG] Error saving/updating user: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void updateUserFields(User user, OidcUser oidcUser) {
        try {
            // First name
            if (oidcUser.getGivenName() != null) {
                try {
                    java.lang.reflect.Method setFirstName = user.getClass().getMethod("setFirstName", String.class);
                    setFirstName.invoke(user, oidcUser.getGivenName());
                } catch (Exception e) {
                    System.out.println("[DEBUG] Could not set first name: " + e.getMessage());
                }
            }
            
            // Last name
            if (oidcUser.getFamilyName() != null) {
                try {
                    java.lang.reflect.Method setLastName = user.getClass().getMethod("setLastName", String.class);
                    setLastName.invoke(user, oidcUser.getFamilyName());
                } catch (Exception e) {
                    System.out.println("[DEBUG] Could not set last name: " + e.getMessage());
                }
            }
            
            // Profile picture
            if (oidcUser.getPicture() != null) {
                try {
                    java.lang.reflect.Method setProfilePictureUrl = user.getClass().getMethod("setProfilePictureUrl", String.class);
                    setProfilePictureUrl.invoke(user, oidcUser.getPicture());
                } catch (Exception e) {
                    System.out.println("[DEBUG] Could not set profile picture: " + e.getMessage());
                }
            }
            
            // Email
            if (oidcUser.getEmail() != null) {
                user.setEmail(oidcUser.getEmail());
            }
            
            // Email verification
            String emailVerified = oidcUser.getClaimAsString("email_verified");
            if (emailVerified != null) {
                try {
                    java.lang.reflect.Method setEmailVerified = user.getClass().getMethod("setEmailVerified", Boolean.class);
                    setEmailVerified.invoke(user, Boolean.valueOf(emailVerified));
                } catch (Exception e) {
                    System.out.println("[DEBUG] Could not set email verification status: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.out.println("[DEBUG] Error updating user fields: " + e.getMessage());
        }
    }
} 
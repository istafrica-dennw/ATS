package com.ats.security;

import com.ats.model.User;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        System.out.println("\n\n[DEBUG] ===== TOKEN EXCHANGE DEBUG =====");
        System.out.println("[DEBUG] Client registration: " + userRequest.getClientRegistration().getRegistrationId());
        System.out.println("[DEBUG] Access token: " + userRequest.getAccessToken().getTokenValue());
        System.out.println("[DEBUG] Token type: " + userRequest.getAccessToken().getTokenType().getValue());
        System.out.println("[DEBUG] Scopes: " + userRequest.getAccessToken().getScopes());
        
        // Enhanced token debugging
        Map<String, Object> params = userRequest.getAdditionalParameters();
        System.out.println("[DEBUG] All additional parameters: " + params);
        
        if (params.containsKey("id_token")) {
            System.out.println("[DEBUG] ID Token found in additional parameters");
            String idToken = params.get("id_token").toString();
            System.out.println("[DEBUG] ID Token: " + idToken);
            
            // Try to decode and check the payload
            try {
                String[] parts = idToken.split("\\.");
                if (parts.length >= 2) {
                    String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                    System.out.println("[DEBUG] ID Token payload: " + payload);
                    
                    // Check if nonce is present in the token
                    if (payload.contains("nonce")) {
                        System.out.println("[DEBUG] Nonce found in ID token payload");
                    } else {
                        System.out.println("[DEBUG] WARNING: Nonce NOT found in ID token payload!");
                    }
                }
            } catch (Exception e) {
                System.out.println("[DEBUG] Error decoding ID token: " + e.getMessage());
            }
        } else {
            System.out.println("[DEBUG] No ID Token found in additional parameters - THIS IS LIKELY THE ISSUE");
            // Check if this might be an OIDC user 
            if (userRequest.getClientRegistration().getScopes().contains("openid")) {
                System.out.println("[DEBUG] This is an OIDC flow but no ID token was received!");
            }
        }
        
        OAuth2User oauth2User = super.loadUser(userRequest);
        System.out.println("[DEBUG] OAuth2User attributes: " + oauth2User.getAttributes());
        
        // Check if it's potentially an OidcUser
        if (oauth2User instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) oauth2User;
            OidcIdToken idToken = oidcUser.getIdToken();
            if (idToken != null) {
                System.out.println("[DEBUG] OidcIdToken found: " + idToken.getTokenValue());
                System.out.println("[DEBUG] OidcIdToken claims: " + idToken.getClaims());
                if (idToken.getClaims().containsKey("nonce")) {
                    System.out.println("[DEBUG] Nonce in ID token: " + idToken.getClaims().get("nonce"));
                } else {
                    System.out.println("[DEBUG] WARNING: No nonce in ID token claims!");
                }
            } else {
                System.out.println("[DEBUG] User is OidcUser but no ID token present - THIS IS UNEXPECTED");
            }
        }
        
        LinkedInOAuth2User linkedInUser = new LinkedInOAuth2User(oauth2User, Role.CANDIDATE);
        System.out.println("[DEBUG] Created LinkedInOAuth2User");

        Optional<User> existingUser = userRepository.findByLinkedinId(linkedInUser.getLinkedinId());
        System.out.println("[DEBUG] Existing user by LinkedIn ID: " + existingUser.isPresent());

        if (existingUser.isPresent()) {
            System.out.println("[DEBUG] Returning existing user");
            return linkedInUser;
        }

        System.out.println("[DEBUG] Creating new user");
        User newUser = new User();
        newUser.setEmail(linkedInUser.getEmail());
        newUser.setFirstName(linkedInUser.getFirstName());
        newUser.setLastName(linkedInUser.getLastName());
        newUser.setLinkedinId(linkedInUser.getLinkedinId());
        newUser.setLinkedinProfileUrl(linkedInUser.getLinkedinProfileUrl());
        newUser.setProfilePictureUrl(linkedInUser.getProfilePictureUrl());
        newUser.setRole(Role.CANDIDATE);
        newUser.setIsActive(true);

        userRepository.save(newUser);
        System.out.println("[DEBUG] Saved new user");
        System.out.println("[DEBUG] ======================\n");

        return linkedInUser;
    }
} 
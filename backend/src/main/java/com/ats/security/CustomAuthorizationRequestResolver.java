package com.ats.security;

import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {
    private final OAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository, String authorizationRequestBaseUri) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        System.out.println("\n\n[DEBUG] ===== AUTHORIZATION REQUEST DEBUG =====");
        System.out.println("[DEBUG] Request URI: " + request.getRequestURI());
        
        OAuth2AuthorizationRequest authorizationRequest = this.defaultResolver.resolve(request);
        if (authorizationRequest != null) {
            String nonce = (String) authorizationRequest.getAdditionalParameters().get("nonce");
            System.out.println("[DEBUG] Nonce from request: " + nonce);
            System.out.println("[DEBUG] Authorization request URI: " + authorizationRequest.getAuthorizationUri());
            System.out.println("[DEBUG] Additional parameters: " + authorizationRequest.getAdditionalParameters());
            System.out.println("[DEBUG] ======================\n");
            return authorizationRequest;
        }

        System.out.println("[DEBUG] No authorization request found");
        System.out.println("[DEBUG] ======================\n");
        return null;
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return resolve(request);
    }
} 
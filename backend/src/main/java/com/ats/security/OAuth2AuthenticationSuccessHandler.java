package com.ats.security;

import com.ats.dto.AuthResponse;
import com.ats.dto.UserDTO;
import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(
            JwtTokenProvider tokenProvider,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        System.out.println("\n\n[DEBUG] OAuth2 Authentication Success");
        System.out.println("[DEBUG] Request URI: " + request.getRequestURI());
        System.out.println("[DEBUG] Authentication: " + authentication);

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        System.out.println("[DEBUG] OAuth2User attributes: " + oAuth2User.getAttributes());
        
        String email = oAuth2User.getAttribute("email");
        System.out.println("[DEBUG] User email: " + email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("[DEBUG] Found user: " + user.getEmail());

        String jwt = tokenProvider.generateToken(authentication);
        System.out.println("[DEBUG] Generated JWT token");

        // Redirect to frontend with token
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + jwt;
        System.out.println("[DEBUG] Redirecting to: " + redirectUrl);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setDepartment(user.getDepartment());
        dto.setLinkedinProfileUrl(user.getLinkedinProfileUrl());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setIsEmailPasswordEnabled(user.getIsEmailPasswordEnabled());
        dto.setLastLogin(user.getLastLogin());
        dto.setIsActive(user.getIsActive());
        return dto;
    }
} 
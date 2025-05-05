package com.ats.security;

import com.ats.dto.AuthResponse;
import com.ats.dto.UserDTO;
import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwt = tokenProvider.generateToken(authentication);
        AuthResponse authResponse = new AuthResponse(jwt, convertToDTO(user));

        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(authResponse));
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
        dto.setAuthenticationMethod(user.getAuthenticationMethod());
        dto.setIsEmailPasswordEnabled(user.getIsEmailPasswordEnabled());
        dto.setLastLogin(user.getLastLogin());
        dto.setIsActive(user.getIsActive());
        return dto;
    }
} 
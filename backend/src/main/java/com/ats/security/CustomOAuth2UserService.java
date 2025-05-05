package com.ats.security;

import com.ats.model.User;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        LinkedInOAuth2User linkedInUser = new LinkedInOAuth2User(oauth2User, Role.CANDIDATE);

        // Check if user exists by LinkedIn ID
        Optional<User> existingUser = userRepository.findByLinkedinId(linkedInUser.getLinkedinId());

        if (existingUser.isPresent()) {
            return linkedInUser;
        }

        // Create new user
        User newUser = new User();
        newUser.setEmail(linkedInUser.getEmail());
        newUser.setFirstName(linkedInUser.getFirstName());
        newUser.setLastName(linkedInUser.getLastName());
        newUser.setLinkedinId(linkedInUser.getLinkedinId());
        newUser.setLinkedinProfileUrl(linkedInUser.getLinkedinProfileUrl());
        newUser.setProfilePictureUrl(linkedInUser.getProfilePictureUrl());
        newUser.setRole(Role.CANDIDATE);
        newUser.setAuthenticationMethod("LINKEDIN");
        newUser.setIsActive(true);

        userRepository.save(newUser);

        return linkedInUser;
    }
} 
package com.ats.security;

import com.ats.model.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class LinkedInOAuth2User implements OAuth2User {
    private final OAuth2User oauth2User;
    private final Role role;

    public LinkedInOAuth2User(OAuth2User oauth2User, Role role) {
        this.oauth2User = oauth2User;
        this.role = role;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getName() {
        return oauth2User.getAttribute("email");
    }

    public String getEmail() {
        return oauth2User.getAttribute("email");
    }

    public String getFirstName() {
        return oauth2User.getAttribute("firstName");
    }

    public String getLastName() {
        return oauth2User.getAttribute("lastName");
    }

    public String getLinkedinId() {
        return oauth2User.getAttribute("id");
    }

    public String getProfilePictureUrl() {
        return oauth2User.getAttribute("profilePicture");
    }

    public String getLinkedinProfileUrl() {
        return oauth2User.getAttribute("profileUrl");
    }
} 
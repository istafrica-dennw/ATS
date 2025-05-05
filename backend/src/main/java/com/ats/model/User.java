package com.ats.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String department;

    @Column(name = "linkedin_id", unique = true)
    private String linkedinId;

    @Column(name = "linkedin_profile_url")
    private String linkedinProfileUrl;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "authentication_method")
    private String authenticationMethod;

    @Column(name = "is_email_password_enabled")
    private Boolean isEmailPasswordEnabled;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "is_active")
    private Boolean isActive;
} 
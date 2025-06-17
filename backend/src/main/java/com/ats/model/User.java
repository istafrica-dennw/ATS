package com.ats.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.time.LocalDate;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "address_line1")
    private String addressLine1;
    
    @Column(name = "address_line2")
    private String addressLine2;
    
    @Column(name = "city")
    private String city;
    
    @Column(name = "state")
    private String state;
    
    @Column(name = "country")
    private String country;
    
    @Column(name = "postal_code")
    private String postalCode;
    
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "deactivation_reason", columnDefinition = "TEXT")
    private String deactivationReason;
    
    @Column(name = "deactivation_date")
    private LocalDateTime deactivationDate;

    @Column(name = "is_email_password_enabled")
    private Boolean isEmailPasswordEnabled;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "is_email_verified", nullable = false)
    private Boolean isEmailVerified = false;
    
    @Column(name = "email_verification_token")
    private String emailVerificationToken;
    
    @Column(name = "email_verification_token_expiry")
    private LocalDateTime emailVerificationTokenExpiry;
    
    @Column(name = "mfa_enabled")
    private Boolean mfaEnabled;
    
    @Column(name = "mfa_secret")
    private String mfaSecret;
    
    // Temporarily using @Transient to avoid hypersistence-utils conflicts
    @Transient
    private String[] mfaRecoveryCodes;
} 
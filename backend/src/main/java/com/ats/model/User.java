package com.ats.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.time.LocalDate;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;
import com.ats.validation.ValidRegion;

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

    @Column(name = "region", length = 10)
    @ValidRegion
    private String region;

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
    
    // Multiple roles support
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<UserRole> userRoles = new HashSet<>();
    
    // Subscription fields
    @Column(name = "is_subscribed")
    private Boolean isSubscribed = false;
    
    @Column(name = "subscribed_at")
    private LocalDateTime subscribedAt;
    
    @Column(name = "unsubscribed_at")
    private LocalDateTime unsubscribedAt;
    
    @Column(name = "subscription_preferences", columnDefinition = "TEXT")
    private String subscriptionPreferences; // JSON string for preferences
    
    // Privacy Policy acceptance
    @Column(name = "privacy_policy_accepted", nullable = false)
    private Boolean privacyPolicyAccepted = false;
    
    @Column(name = "privacy_policy_accepted_at")
    private LocalDateTime privacyPolicyAcceptedAt;
    
    // Helper methods for multiple roles
    /**
     * Get all available roles for this user
     */
    public Set<Role> getAvailableRoles() {
        return userRoles.stream()
            .map(UserRole::getRole)
            .collect(Collectors.toSet());
    }
    
    /**
     * Get the current active role (backward compatibility)
     */
    public Role getCurrentRole() {
        return this.role;
    }
    
    /**
     * Check if user has a specific role
     */
    public boolean hasRole(Role role) {
        return userRoles.stream()
            .anyMatch(ur -> ur.getRole().equals(role));
    }
    
    /**
     * Get primary role
     */
    public Role getPrimaryRole() {
        return userRoles.stream()
            .filter(UserRole::getIsPrimary)
            .map(UserRole::getRole)
            .findFirst()
            .orElse(this.role); // Fallback to current role
    }
    
    /**
     * Add a role to the user
     */
    public void addRole(Role role) {
        if (!hasRole(role)) {
            UserRole userRole = UserRole.builder()
                .user(this)
                .role(role)
                .isPrimary(false)
                .assignedAt(LocalDateTime.now())
                .build();
            userRoles.add(userRole);
        }
    }
    
    /**
     * Remove a role from the user
     */
    public void removeRole(Role role) {
        userRoles.removeIf(ur -> ur.getRole().equals(role));
    }
    
    /**
     * Set primary role
     */
    public void setPrimaryRole(Role role) {
        // Remove primary flag from all roles
        userRoles.forEach(ur -> ur.setIsPrimary(false));
        
        // Set the specified role as primary
        userRoles.stream()
            .filter(ur -> ur.getRole().equals(role))
            .findFirst()
            .ifPresent(ur -> ur.setIsPrimary(true));
    }
} 
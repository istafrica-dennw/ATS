package com.ats.dto;

import com.ats.model.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    @Schema(
        description = "User ID - Auto-generated, read-only", 
        example = "1", 
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private Long id;

    @Schema(
        description = "User's email address - Used as the username for login", 
        example = "john.doe@example.com",
        required = true
    )
    private String email;
    
    @Schema(
        description = "User's password - Only used for creation/updates, never returned in responses", 
        example = "securePassword123", 
        accessMode = Schema.AccessMode.WRITE_ONLY,
        minLength = 8
    )
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Schema(
        description = "User's first name", 
        example = "John",
        required = true
    )
    private String firstName;

    @Schema(
        description = "User's last name", 
        example = "Doe",
        required = true
    )
    private String lastName;

    @Schema(
        description = "User's role in the system - Determines access levels and permissions", 
        example = "CANDIDATE", 
        allowableValues = {"ADMIN", "CANDIDATE", "INTERVIEWER", "HIRING_MANAGER"},
        required = true,
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private Role role;

    @Schema(
        description = "User's department or team within the organization", 
        example = "Engineering"
    )
    private String department;

    @Schema(
        description = "User's region for GDPR compliance - EU = Europe, RW = Rwanda, OTHER = other regions, NULL = default", 
        example = "EU",
        allowableValues = {"EU", "RW", "OTHER"}
    )
    private String region;

    @Schema(
        description = "User's LinkedIn ID (for OAuth users) - Read-only, system-generated for OAuth logins", 
        example = "linkedin123",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private String linkedinId;

    @Schema(
        description = "User's LinkedIn profile URL - Users can update this in their profile settings", 
        example = "https://linkedin.com/in/johndoe"
    )
    private String linkedinProfileUrl;

    @Schema(
        description = "User's profile picture URL - Path to uploaded profile image", 
        example = "/api/files/profile-pictures/1bb1d8f6-649f-490d-85b5-621b16b5d2f7.jpg"
    )
    private String profilePictureUrl;

    @Schema(
        description = "User's birth date in ISO format (YYYY-MM-DD)", 
        example = "1990-01-15"
    )
    private LocalDate birthDate;
    
    @Schema(
        description = "User's phone number with international format", 
        example = "+1 (555) 123-4567"
    )
    private String phoneNumber;
    
    @Schema(
        description = "User's street address (first line)", 
        example = "123 Main Street"
    )
    private String addressLine1;
    
    @Schema(
        description = "User's street address (second line, optional)", 
        example = "Apt 4B"
    )
    private String addressLine2;
    
    @Schema(
        description = "User's city", 
        example = "New York"
    )
    private String city;
    
    @Schema(
        description = "User's state/province", 
        example = "NY"
    )
    private String state;
    
    @Schema(
        description = "User's country", 
        example = "United States"
    )
    private String country;
    
    @Schema(
        description = "User's postal/ZIP code", 
        example = "10001"
    )
    private String postalCode;
    
    @Schema(
        description = "User's biography or personal statement", 
        example = "Full-stack developer with 5 years of experience in React and Spring Boot."
    )
    private String bio;
    
    @Schema(
        description = "Reason provided when deactivating account (read-only for regular users)", 
        example = "Moving to a different platform",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private String deactivationReason;
    
    @Schema(
        description = "Date when the account was deactivated (read-only)",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private LocalDateTime deactivationDate;

    @Schema(
        description = "Whether email/password authentication is enabled for this user (read-only)", 
        example = "true",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private Boolean isEmailPasswordEnabled;
    
    @Schema(
        description = "User's last login date and time (read-only)",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private LocalDateTime lastLogin;
    
    @Schema(
        description = "Whether the user account is active (read-only for regular users)", 
        example = "true",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private Boolean isActive;
    
    @Schema(
        description = "Whether the user's email has been verified (read-only)", 
        example = "true",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private Boolean isEmailVerified;
    
    @Schema(
        description = "Whether to send a verification email (write-only, admin only)", 
        example = "true", 
        accessMode = Schema.AccessMode.WRITE_ONLY
    )
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Boolean sendVerificationEmail;

    @Schema(description = "Whether 2FA is enabled for this user", example = "true")
    private Boolean mfaEnabled;
} 
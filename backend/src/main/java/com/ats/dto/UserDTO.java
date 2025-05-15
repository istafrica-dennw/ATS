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
@Schema(description = "User Data Transfer Object - Contains user information without sensitive data")
public class UserDTO {
    @Schema(description = "User ID", example = "1")
    private Long id;

    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "User's password - Only used for creation/updates", example = "securePassword123", accessMode = Schema.AccessMode.WRITE_ONLY)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @Schema(description = "User's role in the system", example = "CANDIDATE", 
            allowableValues = {"ADMIN", "CANDIDATE", "INTERVIEWER", "HIRING_MANAGER"})
    private Role role;

    @Schema(description = "User's department or team", example = "Engineering")
    private String department;

    @Schema(description = "User's LinkedIn ID (for OAuth users)", example = "linkedin123")
    private String linkedinId;

    @Schema(description = "User's LinkedIn profile URL", example = "https://linkedin.com/in/johndoe")
    private String linkedinProfileUrl;

    @Schema(description = "User's profile picture URL", example = "https://example.com/profile.jpg")
    private String profilePictureUrl;

    @Schema(description = "User's birth date", example = "1990-01-15")
    private LocalDate birthDate;
    
    @Schema(description = "User's phone number", example = "+1 (555) 123-4567")
    private String phoneNumber;
    
    @Schema(description = "User's address line 1", example = "123 Main Street")
    private String addressLine1;
    
    @Schema(description = "User's address line 2", example = "Apt 4B")
    private String addressLine2;
    
    @Schema(description = "User's city", example = "New York")
    private String city;
    
    @Schema(description = "User's state/province", example = "NY")
    private String state;
    
    @Schema(description = "User's country", example = "United States")
    private String country;
    
    @Schema(description = "User's postal code", example = "10001")
    private String postalCode;
    
    @Schema(description = "User's biography", example = "Full-stack developer with 5 years of experience...")
    private String bio;
    
    @Schema(description = "Reason for deactivating account (if applicable)", example = "Moving to a different platform")
    private String deactivationReason;
    
    @Schema(description = "Date when the account was deactivated (if applicable)")
    private LocalDateTime deactivationDate;

    @Schema(description = "Whether email/password authentication is enabled for this user", example = "true")
    private Boolean isEmailPasswordEnabled;
    
    @Schema(description = "User's last login date and time")
    private LocalDateTime lastLogin;
    
    @Schema(description = "Whether the user account is active", example = "true")
    private Boolean isActive;
    
    @Schema(description = "Whether the user's email has been verified", example = "true")
    private Boolean isEmailVerified;
    
    @Schema(description = "Whether to send a verification email (write-only)", example = "true", accessMode = Schema.AccessMode.WRITE_ONLY)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Boolean sendVerificationEmail;
} 
package com.ats.dto;

import com.ats.model.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    @Schema(description = "Whether email/password authentication is enabled for this user", example = "true")
    private Boolean isEmailPasswordEnabled;

    @Schema(description = "User's last login timestamp", example = "2023-05-20T15:30:45")
    private LocalDateTime lastLogin;

    @Schema(description = "Whether the user account is active", example = "true")
    private Boolean isActive;
    
    @Schema(description = "Whether the user's email has been verified", example = "true")
    private Boolean isEmailVerified;
    
    @Schema(description = "Creation timestamp of the user account", example = "2023-05-15T10:20:30")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update timestamp of the user account", example = "2023-05-18T14:25:10")
    private LocalDateTime updatedAt;

    @Schema(description = "Flag to indicate if a verification email should be sent", example = "true")
    private Boolean sendVerificationEmail;
} 
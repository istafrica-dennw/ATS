package com.ats.dto;

import com.ats.model.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User Data Transfer Object")
public class UserDTO {
    @Schema(description = "User ID", example = "1")
    private Long id;

    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;

    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @Schema(description = "User's role", example = "CANDIDATE")
    private Role role;

    @Schema(description = "User's department", example = "HR")
    private String department;

    @Schema(description = "User's LinkedIn ID", example = "linkedin123")
    private String linkedinId;

    @Schema(description = "User's LinkedIn profile URL", example = "https://linkedin.com/in/johndoe")
    private String linkedinProfileUrl;

    @Schema(description = "User's profile picture URL", example = "https://example.com/profile.jpg")
    private String profilePictureUrl;

    @Schema(description = "User's authentication method", example = "LINKEDIN")
    private String authenticationMethod;

    @Schema(description = "Whether email/password authentication is enabled", example = "false")
    private Boolean isEmailPasswordEnabled;

    @Schema(description = "User's last login timestamp")
    private LocalDateTime lastLogin;

    @Schema(description = "Whether the user is active", example = "true")
    private Boolean isActive;
} 
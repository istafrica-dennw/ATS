package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Authentication Request for user registration")
public class AuthRequest {
    @Schema(description = "User's email address", example = "john.doe@example.com", required = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Schema(description = "User's password", example = "password123", required = true, minLength = 6)
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @Schema(description = "User's first name", example = "John", required = true)
    @NotBlank(message = "First name is required")
    private String firstName;

    @Schema(description = "User's last name", example = "Doe", required = true)
    @NotBlank(message = "Last name is required")
    private String lastName;

    @Schema(
        description = "Indicates whether the user has accepted the Privacy Policy. Must be true to register.",
        example = "true",
        required = true
    )
    @NotNull(message = "Privacy Policy acceptance is required")
    private Boolean privacyPolicyAccepted;
} 
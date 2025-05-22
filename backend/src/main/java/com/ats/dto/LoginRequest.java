package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Login Request")
public class LoginRequest {
    @Schema(description = "User's email address", example = "john.doe@example.com")
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Schema(description = "User's password", example = "password123")
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
} 
package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to initiate a password reset process")
public class ForgotPasswordRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    @Schema(description = "Email address associated with the account", 
            example = "user@example.com", 
            required = true)
    private String email;
} 
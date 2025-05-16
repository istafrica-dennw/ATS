package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to reset a user's password using a token")
public class ResetPasswordRequest {
    
    @NotBlank(message = "Token is required")
    @Schema(description = "Reset token received via email", 
            example = "1a434ada-182c-4977-b2dc-86622bf94539", 
            required = true)
    private String token;
    
    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    @Schema(description = "New password that meets complexity requirements", 
            example = "SecureP@ss123", 
            required = true,
            minLength = 8)
    private String newPassword;
    
    @NotBlank(message = "Password confirmation is required")
    @Schema(description = "Confirmation of the new password (must match newPassword)", 
            example = "SecureP@ss123", 
            required = true)
    private String confirmPassword;
} 
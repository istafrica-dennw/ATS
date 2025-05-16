package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request for changing a user's password")
public class ChangePasswordRequest {
    
    @NotBlank(message = "Current password is required")
    @Schema(
        description = "User's current password for verification", 
        example = "oldPassword123", 
        required = true
    )
    private String currentPassword;
    
    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$", 
        message = "Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and no whitespace"
    )
    @Schema(
        description = "New password - Must be at least 8 characters, contain digits, lowercase letters, uppercase letters, and special characters", 
        example = "NewP@ssw0rd", 
        required = true
    )
    private String newPassword;
    
    @NotBlank(message = "Password confirmation is required")
    @Schema(
        description = "Confirmation of the new password - Must match the new password", 
        example = "NewP@ssw0rd", 
        required = true
    )
    private String confirmPassword;
} 
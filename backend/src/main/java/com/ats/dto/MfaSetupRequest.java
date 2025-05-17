package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to initiate MFA setup")
public class MfaSetupRequest {
    
    @Schema(description = "User's password for verification", 
            example = "YourCurrentPassword123", 
            required = true)
    private String currentPassword;
} 
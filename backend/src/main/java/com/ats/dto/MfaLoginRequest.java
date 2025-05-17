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
@Schema(description = "Request to complete login with MFA code")
public class MfaLoginRequest {
    
    @Schema(description = "Email address of the user", 
            example = "user@example.com", 
            required = true)
    private String email;
    
    @Schema(description = "MFA code from the authenticator app", 
            example = "123456", 
            required = true)
    private String code;
    
    @Schema(description = "Recovery code (if used instead of authenticator app)",
            example = "ABCD123456")
    private String recoveryCode;
} 
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
@Schema(description = "Request to verify a MFA code and activate 2FA")
public class MfaVerifyRequest {
    
    @Schema(description = "The verification code from the authenticator app", 
            example = "123456", 
            required = true)
    private String code;
    
    @Schema(description = "The secret key generated during setup", 
            example = "JBSWY3DPEHPK3PXP", 
            required = true)
    private String secret;
} 
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
@Schema(description = "Response containing MFA setup details")
public class MfaSetupResponse {
    
    @Schema(description = "The secret key for the TOTP app", 
            example = "JBSWY3DPEHPK3PXP")
    private String secret;
    
    @Schema(description = "Base64 encoded QR code image to scan with authenticator app", 
            example = "data:image/png;base64,iVBOR...")
    private String qrCodeImageUrl;
    
    @Schema(description = "Array of recovery codes to save in case authenticator is lost", 
            example = "[\"ABCD123456\", \"EFGH789012\"]")
    private String[] recoveryCodes;
} 
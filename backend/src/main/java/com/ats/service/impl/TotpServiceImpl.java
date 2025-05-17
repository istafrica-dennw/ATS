package com.ats.service.impl;

import com.ats.service.TotpService;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.*;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TotpServiceImpl implements TotpService {

    private static final int RECOVERY_CODE_COUNT = 10;
    private static final int RECOVERY_CODE_LENGTH = 10;
    private static final String ISSUER = "ATS System";
    private static final String RECOVERY_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    private final QrGenerator qrGenerator = new ZxingPngQrGenerator();
    private final SecureRandom random = new SecureRandom();
    
    @Override
    public String generateSecret() {
        return secretGenerator.generate();
    }
    
    @Override
    public String generateQrCodeImageUrl(String email, String secret) {
        QrData qrData = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer(ISSUER)
                .algorithm(HashingAlgorithm.SHA1) // Google Authenticator default
                .digits(6)
                .period(30)
                .build();
        
        try {
            byte[] imageData = qrGenerator.generate(qrData);
            String mimeType = qrGenerator.getImageMimeType();
            return "data:" + mimeType + ";base64," + java.util.Base64.getEncoder().encodeToString(imageData);
        } catch (QrGenerationException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
    
    @Override
    public boolean validateCode(String code, String secret) {
        return codeVerifier.isValidCode(secret, code);
    }
    
    @Override
    public String[] generateRecoveryCodes() {
        String[] recoveryCodes = new String[RECOVERY_CODE_COUNT];
        for (int i = 0; i < RECOVERY_CODE_COUNT; i++) {
            recoveryCodes[i] = generateRandomString(RECOVERY_CODE_LENGTH);
        }
        return recoveryCodes;
    }
    
    @Override
    public String[] validateAndRemoveRecoveryCode(String providedCode, String[] storedCodes) {
        if (storedCodes == null || providedCode == null) {
            return null;
        }
        
        for (int i = 0; i < storedCodes.length; i++) {
            if (providedCode.equals(storedCodes[i])) {
                // Recovery code is valid, remove it from the array
                String[] updatedCodes = new String[storedCodes.length - 1];
                System.arraycopy(storedCodes, 0, updatedCodes, 0, i);
                System.arraycopy(storedCodes, i + 1, updatedCodes, i, storedCodes.length - i - 1);
                return updatedCodes;
            }
        }
        
        // No matching recovery code found
        return null;
    }
    
    private String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(RECOVERY_CODE_CHARS.length());
            sb.append(RECOVERY_CODE_CHARS.charAt(randomIndex));
        }
        return sb.toString();
    }
} 
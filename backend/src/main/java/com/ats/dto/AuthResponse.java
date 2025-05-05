package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authentication Response")
public class AuthResponse {
    @Schema(description = "JWT access token")
    private String accessToken;

    @Schema(description = "User details")
    private UserDTO user;
} 
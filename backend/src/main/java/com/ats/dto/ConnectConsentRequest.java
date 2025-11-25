package com.ats.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectConsentRequest {
    @NotNull(message = "Connect consent is required")
    private Boolean connectConsentGiven;
    
    private Boolean futureJobsConsentGiven;
}


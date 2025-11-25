package com.ats.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationConsentRequest {
    @NotNull(message = "Application consent is required")
    private Boolean applicationConsentGiven;
    
    private Boolean futureJobsConsentGiven;
}


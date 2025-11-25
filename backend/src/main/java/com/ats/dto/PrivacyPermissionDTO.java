package com.ats.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrivacyPermissionDTO {
    private Boolean applicationConsentGiven;
    private ZonedDateTime applicationConsentGivenAt;
    private Boolean futureJobsConsentGiven;
    private ZonedDateTime futureJobsConsentGivenAt;
    private Boolean connectConsentGiven;
    private ZonedDateTime connectConsentGivenAt;
    private Boolean dataDeletionRequested;
    private ZonedDateTime dataDeletionRequestedAt;
    private ZonedDateTime dataDeletionScheduledAt;
}


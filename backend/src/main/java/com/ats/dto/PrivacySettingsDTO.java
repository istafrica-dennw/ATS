package com.ats.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrivacySettingsDTO {
    private Boolean applicationConsentCheckboxEnabled;
    private String applicationConsentTerms;
    private Boolean applicationFutureJobsCheckboxEnabled;
    private String applicationFutureJobsTerms;
    private Boolean connectConsentCheckboxEnabled;
    private String connectConsentTerms;
    private Boolean connectFutureJobsCheckboxEnabled;
    private String connectFutureJobsTerms;
    private String companyName;
    private String privacyPolicyUrl;
    private Integer dataRetentionPeriodYears;
}


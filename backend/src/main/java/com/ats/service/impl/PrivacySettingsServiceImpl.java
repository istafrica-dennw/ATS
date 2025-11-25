package com.ats.service.impl;

import com.ats.dto.*;
import com.ats.model.*;
import com.ats.repository.*;
import com.ats.service.PrivacySettingsService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;

@Service
public class PrivacySettingsServiceImpl implements PrivacySettingsService {
    
    private static final Logger logger = LoggerFactory.getLogger(PrivacySettingsServiceImpl.class);
    
    private final PrivacySettingRepository privacySettingRepository;
    private final PrivacyConsentLogRepository privacyConsentLogRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public PrivacySettingsServiceImpl(
            PrivacySettingRepository privacySettingRepository,
            PrivacyConsentLogRepository privacyConsentLogRepository,
            UserRepository userRepository) {
        this.privacySettingRepository = privacySettingRepository;
        this.privacyConsentLogRepository = privacyConsentLogRepository;
        this.userRepository = userRepository;
    }
    
    @Override
    public PrivacySettingsDTO getPrivacySettings() {
        return PrivacySettingsDTO.builder()
            .applicationConsentCheckboxEnabled(getBooleanSetting("application_consent_checkbox_enabled", true))
            .applicationConsentTerms(getSettingValue("application_consent_terms", 
                "I have read the {privacy-policy} and confirm that IST store my personal details to be able to process my application."))
            .applicationFutureJobsCheckboxEnabled(getBooleanSetting("application_future_jobs_checkbox_enabled", true))
            .applicationFutureJobsTerms(getSettingValue("application_future_jobs_terms",
                "Yes, {company-name} can contact me directly about specific future job opportunities."))
            .connectConsentCheckboxEnabled(getBooleanSetting("connect_consent_checkbox_enabled", true))
            .connectConsentTerms(getSettingValue("connect_consent_terms",
                "I have read the {privacy-policy} and confirm that IST store my personal details to be able to contact me for future job opportunities. IST will hold your data for future employment opportunities for a maximum period of 2 years, or until you decide to withdraw your consent, which you can do at any given time by contacting us."))
            .connectFutureJobsCheckboxEnabled(getBooleanSetting("connect_future_jobs_checkbox_enabled", true))
            .connectFutureJobsTerms(getSettingValue("connect_future_jobs_terms",
                "Yes, {company-name} can contact me directly about specific future job opportunities."))
            .companyName(getSettingValue("company_name", "IST"))
            .privacyPolicyUrl(getSettingValue("privacy_policy_url", "/privacy-policy"))
            .dataRetentionPeriodYears(Integer.parseInt(getSettingValue("data_retention_period_years", "2")))
            .build();
    }
    
    @Override
    @Transactional
    public PrivacySettingsDTO updatePrivacySettings(PrivacySettingsDTO settingsDTO) {
        updateSetting("application_consent_checkbox_enabled", String.valueOf(settingsDTO.getApplicationConsentCheckboxEnabled()));
        updateSetting("application_consent_terms", settingsDTO.getApplicationConsentTerms());
        updateSetting("application_future_jobs_checkbox_enabled", String.valueOf(settingsDTO.getApplicationFutureJobsCheckboxEnabled()));
        updateSetting("application_future_jobs_terms", settingsDTO.getApplicationFutureJobsTerms());
        updateSetting("connect_consent_checkbox_enabled", String.valueOf(settingsDTO.getConnectConsentCheckboxEnabled()));
        updateSetting("connect_consent_terms", settingsDTO.getConnectConsentTerms());
        updateSetting("connect_future_jobs_checkbox_enabled", String.valueOf(settingsDTO.getConnectFutureJobsCheckboxEnabled()));
        updateSetting("connect_future_jobs_terms", settingsDTO.getConnectFutureJobsTerms());
        updateSetting("company_name", settingsDTO.getCompanyName());
        updateSetting("privacy_policy_url", settingsDTO.getPrivacyPolicyUrl());
        updateSetting("data_retention_period_years", String.valueOf(settingsDTO.getDataRetentionPeriodYears()));
        
        return getPrivacySettings();
    }
    
    @Override
    public PrivacyPermissionDTO getPrivacyPermissions(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return PrivacyPermissionDTO.builder()
            .applicationConsentGiven(user.getApplicationConsentGiven())
            .applicationConsentGivenAt(user.getApplicationConsentGivenAt() != null ? 
                user.getApplicationConsentGivenAt().atZone(java.time.ZoneId.systemDefault()) : null)
            .futureJobsConsentGiven(user.getFutureJobsConsentGiven())
            .futureJobsConsentGivenAt(user.getFutureJobsConsentGivenAt() != null ? 
                user.getFutureJobsConsentGivenAt().atZone(java.time.ZoneId.systemDefault()) : null)
            .connectConsentGiven(user.getConnectConsentGiven())
            .connectConsentGivenAt(user.getConnectConsentGivenAt() != null ? 
                user.getConnectConsentGivenAt().atZone(java.time.ZoneId.systemDefault()) : null)
            .dataDeletionRequested(user.getDataDeletionRequested())
            .dataDeletionRequestedAt(user.getDataDeletionRequestedAt() != null ? 
                user.getDataDeletionRequestedAt().atZone(java.time.ZoneId.systemDefault()) : null)
            .dataDeletionScheduledAt(user.getDataDeletionScheduledAt() != null ? 
                user.getDataDeletionScheduledAt().atZone(java.time.ZoneId.systemDefault()) : null)
            .build();
    }
    
    @Override
    @Transactional
    public PrivacyPermissionDTO recordApplicationConsent(Long userId, ApplicationConsentRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get current terms for logging
        String terms = getSettingValue("application_consent_terms", "");
        String futureJobsTerms = getSettingValue("application_future_jobs_terms", "");
        
        // Record application consent
        if (Boolean.TRUE.equals(request.getApplicationConsentGiven())) {
            user.setApplicationConsentGiven(true);
            user.setApplicationConsentGivenAt(java.time.LocalDateTime.now());
            
            // Log consent
            logConsent(user, "APPLICATION", "GIVEN", terms, httpRequest);
        }
        
        // Record future jobs consent
        if (Boolean.TRUE.equals(request.getFutureJobsConsentGiven())) {
            user.setFutureJobsConsentGiven(true);
            user.setFutureJobsConsentGivenAt(java.time.LocalDateTime.now());
            
            // Log consent
            logConsent(user, "FUTURE_JOBS", "GIVEN", futureJobsTerms, httpRequest);
        }
        
        userRepository.save(user);
        
        return getPrivacyPermissions(userId);
    }
    
    @Override
    @Transactional
    public PrivacyPermissionDTO recordConnectConsent(Long userId, ConnectConsentRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get current terms for logging
        String terms = getSettingValue("connect_consent_terms", "");
        String futureJobsTerms = getSettingValue("connect_future_jobs_terms", "");
        
        // Record connect consent
        if (Boolean.TRUE.equals(request.getConnectConsentGiven())) {
            user.setConnectConsentGiven(true);
            user.setConnectConsentGivenAt(java.time.LocalDateTime.now());
            
            // Log consent
            logConsent(user, "CONNECT", "GIVEN", terms, httpRequest);
        }
        
        // Record future jobs consent
        if (Boolean.TRUE.equals(request.getFutureJobsConsentGiven())) {
            user.setFutureJobsConsentGiven(true);
            user.setFutureJobsConsentGivenAt(java.time.LocalDateTime.now());
            
            // Log consent
            logConsent(user, "FUTURE_JOBS", "GIVEN", futureJobsTerms, httpRequest);
        }
        
        userRepository.save(user);
        
        return getPrivacyPermissions(userId);
    }
    
    @Override
    @Transactional
    public void withdrawConsent(Long userId, String consentType, HttpServletRequest httpRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        switch (consentType.toUpperCase()) {
            case "APPLICATION":
                user.setApplicationConsentGiven(false);
                logConsent(user, "APPLICATION", "WITHDRAWN", null, httpRequest);
                break;
            case "FUTURE_JOBS":
                user.setFutureJobsConsentGiven(false);
                logConsent(user, "FUTURE_JOBS", "WITHDRAWN", null, httpRequest);
                break;
            case "CONNECT":
                user.setConnectConsentGiven(false);
                logConsent(user, "CONNECT", "WITHDRAWN", null, httpRequest);
                break;
        }
        
        userRepository.save(user);
    }
    
    @Override
    public String getSettingValue(String settingKey) {
        return getSettingValue(settingKey, null);
    }
    
    @Override
    public String getSettingValue(String settingKey, String defaultValue) {
        Optional<PrivacySetting> setting = privacySettingRepository.findBySettingKeyAndIsActiveTrue(settingKey);
        return setting.map(PrivacySetting::getSettingValue).orElse(defaultValue);
    }
    
    @Override
    public Boolean getBooleanSetting(String settingKey, Boolean defaultValue) {
        String value = getSettingValue(settingKey);
        if (value == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value);
    }
    
    private void updateSetting(String key, String value) {
        Optional<PrivacySetting> setting = privacySettingRepository.findBySettingKey(key);
        if (setting.isPresent()) {
            PrivacySetting s = setting.get();
            s.setSettingValue(value);
            privacySettingRepository.save(s);
        } else {
            PrivacySetting newSetting = new PrivacySetting();
            newSetting.setSettingKey(key);
            newSetting.setSettingValue(value);
            newSetting.setIsActive(true);
            privacySettingRepository.save(newSetting);
        }
    }
    
    private void logConsent(User user, String consentType, String action, String termsVersion, HttpServletRequest request) {
        PrivacyConsentLog log = new PrivacyConsentLog();
        log.setUser(user);
        log.setConsentType(consentType);
        log.setAction(action);
        log.setTermsVersion(termsVersion);
        if (request != null) {
            log.setIpAddress(getClientIpAddress(request));
            log.setUserAgent(request.getHeader("User-Agent"));
        }
        privacyConsentLogRepository.save(log);
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}


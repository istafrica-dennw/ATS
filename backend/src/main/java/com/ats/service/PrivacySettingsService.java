package com.ats.service;

import com.ats.dto.PrivacySettingsDTO;
import com.ats.dto.ApplicationConsentRequest;
import com.ats.dto.ConnectConsentRequest;
import com.ats.dto.PrivacyPermissionDTO;
import com.ats.model.User;
import jakarta.servlet.http.HttpServletRequest;

public interface PrivacySettingsService {
    PrivacySettingsDTO getPrivacySettings();
    PrivacySettingsDTO updatePrivacySettings(PrivacySettingsDTO settingsDTO);
    PrivacyPermissionDTO getPrivacyPermissions(Long userId);
    PrivacyPermissionDTO recordApplicationConsent(Long userId, ApplicationConsentRequest request, HttpServletRequest httpRequest);
    PrivacyPermissionDTO recordConnectConsent(Long userId, ConnectConsentRequest request, HttpServletRequest httpRequest);
    void withdrawConsent(Long userId, String consentType, HttpServletRequest httpRequest);
    String getSettingValue(String settingKey);
    String getSettingValue(String settingKey, String defaultValue);
    Boolean getBooleanSetting(String settingKey, Boolean defaultValue);
}


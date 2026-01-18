package com.ats.service;

import com.ats.dto.UserJobPreferenceDTO;

import java.util.List;

public interface UserJobPreferenceService {

    /**
     * Save user job preferences from career portal connect feature
     */
    UserJobPreferenceDTO savePreference(UserJobPreferenceDTO preferenceDTO);

    /**
     * Get preference by ID
     */
    UserJobPreferenceDTO getPreferenceById(Long id);

    /**
     * Get all preferences for an email
     */
    List<UserJobPreferenceDTO> getPreferencesByEmail(String email);

    /**
     * Get all preferences (for admin)
     */
    List<UserJobPreferenceDTO> getAllPreferences();

    /**
     * Delete preference by ID
     */
    void deletePreference(Long id);

    /**
     * Check if email already has preferences
     */
    boolean emailExists(String email);
}


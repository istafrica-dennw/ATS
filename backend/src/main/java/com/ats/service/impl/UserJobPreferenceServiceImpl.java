package com.ats.service.impl;

import com.ats.dto.UserJobPreferenceDTO;
import com.ats.exception.ResourceNotFoundException;
import com.ats.model.JobCategory;
import com.ats.model.UserJobPreference;
import com.ats.repository.JobCategoryRepository;
import com.ats.repository.UserJobPreferenceRepository;
import com.ats.service.UserJobPreferenceService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserJobPreferenceServiceImpl implements UserJobPreferenceService {

    private static final Logger logger = LoggerFactory.getLogger(UserJobPreferenceServiceImpl.class);

    private final UserJobPreferenceRepository userJobPreferenceRepository;
    private final JobCategoryRepository jobCategoryRepository;

    @Override
    @Transactional
    public UserJobPreferenceDTO savePreference(UserJobPreferenceDTO preferenceDTO) {
        logger.info("Saving user job preference for email: {}", preferenceDTO.getEmail());

        UserJobPreference preference = new UserJobPreference();
        preference.setEmail(preferenceDTO.getEmail().toLowerCase().trim());
        preference.setConsentAccepted(preferenceDTO.getConsentAccepted() != null && preferenceDTO.getConsentAccepted());

        if (preference.getConsentAccepted()) {
            preference.setConsentAcceptedAt(ZonedDateTime.now());
        }

        // Load and set job categories
        if (preferenceDTO.getCategoryIds() != null && !preferenceDTO.getCategoryIds().isEmpty()) {
            Set<JobCategory> categories = new HashSet<>();
            for (Long categoryId : preferenceDTO.getCategoryIds()) {
                JobCategory category = jobCategoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResourceNotFoundException("Job category not found with ID: " + categoryId));
                categories.add(category);
            }
            preference.setJobCategories(categories);
        }

        UserJobPreference savedPreference = userJobPreferenceRepository.save(preference);
        logger.info("User job preference saved with ID: {}", savedPreference.getId());

        return mapToDTO(savedPreference);
    }

    @Override
    @Transactional(readOnly = true)
    public UserJobPreferenceDTO getPreferenceById(Long id) {
        logger.debug("Fetching user job preference with ID: {}", id);
        UserJobPreference preference = userJobPreferenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User job preference not found with ID: " + id));
        return mapToDTO(preference);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserJobPreferenceDTO> getPreferencesByEmail(String email) {
        logger.debug("Fetching user job preferences for email: {}", email);
        return userJobPreferenceRepository.findByEmail(email.toLowerCase().trim()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserJobPreferenceDTO> getAllPreferences() {
        logger.debug("Fetching all user job preferences");
        return userJobPreferenceRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePreference(Long id) {
        logger.info("Deleting user job preference with ID: {}", id);
        if (!userJobPreferenceRepository.existsById(id)) {
            throw new ResourceNotFoundException("User job preference not found with ID: " + id);
        }
        userJobPreferenceRepository.deleteById(id);
        logger.info("User job preference with ID {} deleted successfully", id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userJobPreferenceRepository.existsByEmail(email.toLowerCase().trim());
    }

    private UserJobPreferenceDTO mapToDTO(UserJobPreference preference) {
        List<Long> categoryIds = preference.getJobCategories().stream()
                .map(JobCategory::getId)
                .collect(Collectors.toList());

        List<String> categoryNames = preference.getJobCategories().stream()
                .map(JobCategory::getName)
                .collect(Collectors.toList());

        return UserJobPreferenceDTO.builder()
                .id(preference.getId())
                .email(preference.getEmail())
                .categoryIds(categoryIds)
                .categoryNames(categoryNames)
                .consentAccepted(preference.getConsentAccepted())
                .consentAcceptedAt(preference.getConsentAcceptedAt())
                .createdAt(preference.getCreatedAt())
                .build();
    }
}


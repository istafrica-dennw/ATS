package com.ats.repository;

import com.ats.model.PrivacySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrivacySettingRepository extends JpaRepository<PrivacySetting, Long> {
    Optional<PrivacySetting> findBySettingKey(String settingKey);
    Optional<PrivacySetting> findBySettingKeyAndIsActiveTrue(String settingKey);
}


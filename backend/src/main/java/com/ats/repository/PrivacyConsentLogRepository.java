package com.ats.repository;

import com.ats.model.PrivacyConsentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivacyConsentLogRepository extends JpaRepository<PrivacyConsentLog, Long> {
    List<PrivacyConsentLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PrivacyConsentLog> findByUserIdAndConsentTypeOrderByCreatedAtDesc(Long userId, String consentType);
}


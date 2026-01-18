package com.ats.repository;

import com.ats.model.UserJobPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserJobPreferenceRepository extends JpaRepository<UserJobPreference, Long> {

    /**
     * Find all preferences by email
     */
    List<UserJobPreference> findByEmail(String email);

    /**
     * Find the most recent preference by email
     */
    Optional<UserJobPreference> findFirstByEmailOrderByCreatedAtDesc(String email);

    /**
     * Check if email already exists
     */
    boolean existsByEmail(String email);

    /**
     * Find all preferences with consent accepted
     */
    List<UserJobPreference> findByConsentAcceptedTrue();

    /**
     * Find preferences by job category ID
     */
    @Query("SELECT DISTINCT ujp FROM UserJobPreference ujp JOIN ujp.jobCategories jc WHERE jc.id = :categoryId")
    List<UserJobPreference> findByJobCategoryId(@Param("categoryId") Long categoryId);

    /**
     * Find all preferences ordered by creation date descending
     */
    List<UserJobPreference> findAllByOrderByCreatedAtDesc();
}


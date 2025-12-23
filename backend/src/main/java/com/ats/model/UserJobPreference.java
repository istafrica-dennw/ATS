package com.ats.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_job_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserJobPreference extends BaseEntity {

    @Column(nullable = false)
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    private String email;

    @Column(name = "consent_accepted", nullable = false)
    private Boolean consentAccepted = false;

    @Column(name = "consent_accepted_at")
    private ZonedDateTime consentAcceptedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_job_preference_categories",
        joinColumns = @JoinColumn(name = "user_job_preference_id"),
        inverseJoinColumns = @JoinColumn(name = "job_category_id")
    )
    private Set<JobCategory> jobCategories = new HashSet<>();
}


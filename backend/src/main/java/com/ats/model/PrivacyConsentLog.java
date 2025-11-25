package com.ats.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.ZonedDateTime;

@Entity
@Table(name = "privacy_consent_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrivacyConsentLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "consent_type", nullable = false, length = 50)
    private String consentType; // 'APPLICATION', 'FUTURE_JOBS', 'CONNECT'
    
    @Column(name = "action", nullable = false, length = 50)
    private String action; // 'GIVEN', 'WITHDRAWN', 'UPDATED'
    
    @Column(name = "terms_version", columnDefinition = "TEXT")
    private String termsVersion; // Store the terms text that was shown to user
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();
}

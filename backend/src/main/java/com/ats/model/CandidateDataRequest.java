package com.ats.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.ZonedDateTime;

@Entity
@Table(name = "candidate_data_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDataRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "request_type", nullable = false, length = 50)
    private String requestType; // 'EXPORT', 'DELETE', 'UPDATE'
    
    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING"; // 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'
    
    @Column(name = "requested_at", nullable = false)
    private ZonedDateTime requestedAt = ZonedDateTime.now();
    
    @Column(name = "processed_at")
    private ZonedDateTime processedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;
    
    @Column(name = "response_data", columnDefinition = "TEXT")
    private String responseData; // JSON data or file path
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();
    
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt = ZonedDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}


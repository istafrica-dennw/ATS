package com.ats.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDataRequestDTO {
    private Long id;
    private Long userId;
    
    @NotNull(message = "Request type is required")
    private String requestType; // 'EXPORT', 'DELETE', 'UPDATE'
    
    private String status; // 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'
    private ZonedDateTime requestedAt;
    private ZonedDateTime processedAt;
    private Long processedById;
    private String responseData;
    private String notes;
}


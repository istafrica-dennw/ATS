package com.ats.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignInterviewRequest {
    
    @NotNull(message = "Application ID is required")
    private Long applicationId;
    
    @NotNull(message = "Interviewer ID is required")
    private Long interviewerId;
    
    @NotNull(message = "Skeleton ID is required")
    private Long skeletonId;
    
    private LocalDateTime scheduledAt;
    
    private String notes; // Optional notes for the interviewer
} 
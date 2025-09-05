package com.ats.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import com.ats.validation.MultipleOf15;
import com.ats.model.LocationType;
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
    
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 180, message = "Duration cannot exceed 180 minutes")
    @MultipleOf15(message = "Duration must be a multiple of 15 minutes")
    private Integer durationMinutes; // Duration of the interview in minutes
    
    @NotNull(message = "Location type is required")
    private LocationType locationType; // OFFICE or ONLINE
    
    private String locationAddress; // Address for office interviews
    
    private String notes; // Optional notes for the interviewer
    
    private Boolean sendCalendarInvite = false; // Whether to send calendar invites to participants
} 
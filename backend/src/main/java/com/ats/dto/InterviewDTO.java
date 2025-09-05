package com.ats.dto;

import com.ats.model.InterviewStatus;
import com.ats.model.LocationType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDTO {
    
    private Long id;
    private Long applicationId;
    private Long interviewerId;
    private String interviewerName; // For display purposes
    private String interviewerEmail; // For display purposes
    private Long skeletonId;
    private String skeletonName; // For display purposes
    private List<InterviewResponseDTO> responses;
    private InterviewStatus status;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private LocationType locationType;
    private String locationAddress;
    private LocalDateTime completedAt;
    private Long assignedById;
    private String assignedByName; // For display purposes
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    // Nested application info for interviewer view
    private ApplicationSummaryDTO application;
    
    // Nested skeleton info for interviewer view
    private InterviewSkeletonDTO skeleton;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewResponseDTO {
        private String title;
        private String feedback;
        private Integer rating; // 0-100
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationSummaryDTO {
        private Long id;
        private String candidateName;
        private String candidateEmail;
        private Long jobId;
        private String jobTitle;
        private String resumeUrl;
        private ZonedDateTime appliedAt;
    }
} 
package com.ats.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSkeletonDTO {
    
    private Long id;
    private Long jobId;
    private String jobTitle; // For display purposes
    private String name;
    private String description;
    private List<FocusAreaDTO> focusAreas;
    private Long createdById;
    private String createdByName; // For display purposes
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusAreaDTO {
        private String title;
        private String description;
    }
} 
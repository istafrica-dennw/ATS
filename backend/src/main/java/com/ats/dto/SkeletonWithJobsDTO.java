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
public class SkeletonWithJobsDTO {
    
    private Long id;
    private String name;
    private String description;
    private List<FocusAreaDTO> focusAreas;
    private List<JobSummaryDTO> associatedJobs;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String createdByName;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusAreaDTO {
        private String title;
        private String description;
        private Double weight;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobSummaryDTO {
        private Long id;
        private String title;
        private String status;
    }
}
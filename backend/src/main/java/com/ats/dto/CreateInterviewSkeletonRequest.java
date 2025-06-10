package com.ats.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateInterviewSkeletonRequest {
    
    @NotNull(message = "Job ID is required")
    private Long jobId;
    
    @NotBlank(message = "Skeleton name is required")
    private String name;
    
    private String description;
    
    @NotEmpty(message = "Focus areas are required")
    private List<FocusAreaRequest> focusAreas;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusAreaRequest {
        @NotBlank(message = "Focus area title is required")
        private String title;
        
        private String description;
    }
} 
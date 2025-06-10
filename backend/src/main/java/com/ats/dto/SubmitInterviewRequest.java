package com.ats.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitInterviewRequest {
    
    @NotEmpty(message = "Interview responses are required")
    private List<InterviewResponseRequest> responses;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewResponseRequest {
        @NotBlank(message = "Focus area title is required")
        private String title;
        
        @NotBlank(message = "Feedback is required")
        private String feedback;
        
        @NotNull(message = "Rating is required")
        @Min(value = 0, message = "Rating must be between 0 and 100")
        @Max(value = 100, message = "Rating must be between 0 and 100")
        private Integer rating;
    }
} 
package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Job Offer Email Request")
public class JobOfferEmailRequest {
    
    @Schema(description = "Email subject", example = "Job Offer - Software Engineer Position")
    private String subject;
    
    @Schema(description = "Email body content")
    private String body;
} 
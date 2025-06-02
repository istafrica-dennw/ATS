package com.ats.dto;

import com.ats.model.ApplicationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Application data transfer object")
public class ApplicationDTO {

    @Schema(description = "Application ID - auto-generated", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "ID of the job being applied for", example = "1", required = true)
    @NotNull(message = "Job ID is required")
    @Positive(message = "Job ID must be positive")
    private Long jobId;

    @Schema(description = "ID of the candidate applying", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long candidateId;

    @Schema(description = "Current status of the application", example = "APPLIED", accessMode = Schema.AccessMode.READ_ONLY)
    private ApplicationStatus status;

    @Schema(description = "URL to the candidate's resume", example = "https://storage.example.com/resumes/abc123.pdf")
    private String resumeUrl;

    @Schema(description = "URL to the candidate's cover letter", example = "https://storage.example.com/cover-letters/abc123.pdf")
    private String coverLetterUrl;

    @Schema(description = "URL to the candidate's portfolio", example = "https://johndoe-portfolio.com")
    private String portfolioUrl;

    @Schema(description = "Years of relevant experience", example = "5.5")
    private BigDecimal experienceYears;

    @Schema(description = "Candidate's current company", example = "Acme Inc.")
    private String currentCompany;

    @Schema(description = "Candidate's current position", example = "Senior Software Engineer")
    private String currentPosition;

    @Schema(description = "Candidate's expected salary", example = "120000.00")
    private BigDecimal expectedSalary;

    @Schema(description = "Date and time when the application was created", accessMode = Schema.AccessMode.READ_ONLY)
    private ZonedDateTime createdAt;

    @Schema(description = "Date and time when the application was last updated", accessMode = Schema.AccessMode.READ_ONLY)
    private ZonedDateTime updatedAt;

    @Schema(description = "AI-powered resume analysis data", accessMode = Schema.AccessMode.READ_ONLY)
    private ResumeAnalysisDTO resumeAnalysis;

    @Schema(description = "Answers to custom questions for this job")
    @Valid
    private List<ApplicationAnswerDTO> answers = new ArrayList<>();
}

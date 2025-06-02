package com.ats.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "AI-extracted resume analysis data")
public class ResumeAnalysisDTO {

    @Schema(description = "Total years of work experience (excluding overlaps)", example = "5.5")
    @JsonProperty("total_experience_years")
    private BigDecimal totalExperienceYears;

    @Schema(description = "Total number of companies worked for", example = "3")
    @JsonProperty("total_companies_worked")
    private Integer totalCompaniesWorked;

    @Schema(description = "Current company name", example = "Tech Corp")
    @JsonProperty("current_company")
    private String currentCompany;

    @Schema(description = "Current job position", example = "Senior Software Engineer")
    @JsonProperty("current_position")
    private String currentPosition;

    @Schema(description = "List of previous work positions")
    @JsonProperty("previous_positions")
    private List<WorkExperienceDTO> previousPositions;

    @Schema(description = "Skills extracted from resume")
    @JsonProperty("skills_extracted")
    private List<String> skillsExtracted;

    @Schema(description = "Education details")
    @JsonProperty("education")
    private List<EducationDTO> education;

    @Schema(description = "Resume scoring details")
    @JsonProperty("resume_score")
    private ResumeScoreDTO resumeScore;

    @Schema(description = "Analysis processing metadata")
    @JsonProperty("analysis_metadata")
    private AnalysisMetadataDTO analysisMetadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Work experience details")
    public static class WorkExperienceDTO {
        
        @Schema(description = "Company name", example = "StartupXYZ")
        private String company;
        
        @Schema(description = "Job position", example = "Software Engineer")
        private String position;
        
        @Schema(description = "Duration in months", example = "18")
        @JsonProperty("duration_months")
        private Integer durationMonths;
        
        @Schema(description = "Start date (YYYY-MM format)", example = "2020-01")
        @JsonProperty("start_date")
        private String startDate;
        
        @Schema(description = "End date (YYYY-MM format)", example = "2021-06")
        @JsonProperty("end_date")
        private String endDate;
        
        @Schema(description = "Key responsibilities and achievements")
        private List<String> responsibilities;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Education details")
    public static class EducationDTO {
        
        @Schema(description = "Degree or qualification", example = "Bachelor of Computer Science")
        private String degree;
        
        @Schema(description = "Educational institution", example = "University ABC")
        private String institution;
        
        @Schema(description = "Graduation year", example = "2019")
        @JsonProperty("graduation_year")
        private Integer graduationYear;
        
        @Schema(description = "GPA or grade", example = "3.8")
        private String grade;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Resume scoring details")
    public static class ResumeScoreDTO {
        
        @Schema(description = "Overall resume score (0-100)", example = "85")
        @JsonProperty("overall_score")
        private Integer overallScore;
        
        @Schema(description = "Job match score (0-100)", example = "78")
        @JsonProperty("job_match_score")
        private Integer jobMatchScore;
        
        @Schema(description = "Experience level score (0-100)", example = "90")
        @JsonProperty("experience_score")
        private Integer experienceScore;
        
        @Schema(description = "Skills match score (0-100)", example = "82")
        @JsonProperty("skills_match_score")
        private Integer skillsMatchScore;
        
        @Schema(description = "Detailed scoring criteria")
        @JsonProperty("scoring_criteria")
        private ScoringCriteriaDTO scoringCriteria;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Detailed scoring criteria")
    public static class ScoringCriteriaDTO {
        
        @Schema(description = "Required skills match ratio (0.0-1.0)", example = "0.85")
        @JsonProperty("required_skills_match")
        private BigDecimal requiredSkillsMatch;
        
        @Schema(description = "Experience level match ratio (0.0-1.0)", example = "0.90")
        @JsonProperty("experience_level_match")
        private BigDecimal experienceLevelMatch;
        
        @Schema(description = "Industry relevance ratio (0.0-1.0)", example = "0.75")
        @JsonProperty("industry_relevance")
        private BigDecimal industryRelevance;
        
        @Schema(description = "Education level match ratio (0.0-1.0)", example = "0.80")
        @JsonProperty("education_level_match")
        private BigDecimal educationLevelMatch;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Analysis processing metadata")
    public static class AnalysisMetadataDTO {
        
        @Schema(description = "When the analysis was processed")
        @JsonProperty("processed_at")
        private LocalDateTime processedAt;
        
        @Schema(description = "AI model used for analysis", example = "gpt-4")
        @JsonProperty("ai_model_used")
        private String aiModelUsed;
        
        @Schema(description = "Confidence score of the analysis (0.0-1.0)", example = "0.92")
        @JsonProperty("confidence_score")
        private BigDecimal confidenceScore;
        
        @Schema(description = "Processing time in milliseconds", example = "2500")
        @JsonProperty("processing_time_ms")
        private Long processingTimeMs;
        
        @Schema(description = "Any errors or warnings during processing")
        private List<String> processingNotes;
    }
} 
package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import com.ats.model.JobStatus;
import com.ats.model.WorkSetting;


@Data
@NoArgsConstructor
// @Schema(
//     description = "Job Data Transfer Object - Contains Job information for job operations",
//     example = "{\n" +
//               "  \"id\": 1,\n" +
//               "  \"title\": \"Software Engineer\",\n" +
//               "  \"description\": \"Job description goes here\",\n" +
//               "  \"location\": \"Kimihurura\",\n" +
//               "  \"employmentType\": \"Full Time\",\n" +
//               "  \"skills\": [\"Java\", \"React\", \"REST\"],\n" +
//               "  \"postedDate\": \"2024-11-11\",\n" +
//               "  \"workSettings\": \"HYBRID\",\n" +
//               "  \"isActive\": true,\n" +
//               "  \"salaryRange\": \"200,000 - 500,000\"\n" +
//               "  \"status\": \"DRAFT\"\n" +
//               "  \"department\": \"Tech & Development\"\n" +

//               "}"
// )
@Getter
@Setter
public class JobDTO {

    @Schema(
        description = "Job Id - auto-generated - read-only",
        example = "1",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private Long id;

    @Schema(
        description = "Job's title",
        example = "Software Engineer",
        required = true
    )
    @NotBlank (message="Title can't be blank")
    private String title;

    @Schema(
        description = "Departememt of the hire",
        example = "Tech & Development",
        required = true
    )
    private String department;


    @Schema(
        description = "Detailed description of the job",
        example = "We are looking for a software engineer to build enterprise APIs.",
        required = true
    )
    private String description;

    @Schema(
        description = "Job location",
        example = "Kimihurura",
        required = true
    )
    private String location;

    @Schema(
        description = "Type of employment (e.g., Full Time, Part Time, Contract)",
        example = "Full Time",
        required = true
    )
    private String employmentType;


    @Schema(
        description = "Required skills for the job",
        example = "[\"Java\", \"React\", \"REST\"]"
    )
    private List<String> skills;

    @Schema(
        description = "Date when the job was posted",
        example = "2024-11-11",
        required = true
    )
    private LocalDate postedDate;

    @Schema(
        description = "Work setting: REMOTE, ONSITE, or HYBRID",
        example = "HYBRID",
        required = true
    )
    private WorkSetting workSetting;

    @Schema(
        description = "Job Status: DRAFT, PUBLISHED, CLOSED, EXPIRED, REOPENED",
        example = "HYBRID"
    )
    private JobStatus jobStatus;

    @Schema(
        description = "Whether the job listing is active",
        example = "true"
    )
    private Boolean getIsActive(){
        return this.jobStatus.equals(JobStatus.PUBLISHED) ||  this.jobStatus.equals(JobStatus.REOPENED);
    };


    @Schema(
        description = "Expected salary range for the job",
        example = "200,000 - 500,000"
    )
    private String salaryRange;
    
    @Schema(
        description = "List of custom questions for this job",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private List<JobCustomQuestionDTO> customQuestions;
    
    @Schema(
        description = "Job's region for GDPR compliance - EU = Europe, RW = Rwanda, OTHER = other regions, NULL = default", 
        example = "EU",
        allowableValues = {"EU", "RW", "OTHER"}
    )
    private String region;

    // Getters and Setters (or use Lombok @Data if preferred)
    
    // Optional: Constructors, toString, equals, etc.
}

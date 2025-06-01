package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Application answer data transfer object")
public class ApplicationAnswerDTO {

    @Schema(description = "Answer ID - auto-generated", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "ID of the application this answer belongs to", accessMode = Schema.AccessMode.READ_ONLY)
    private Long applicationId;

    @Schema(description = "ID of the question being answered", example = "1", required = true)
    @NotNull(message = "Question ID is required")
    @Positive(message = "Question ID must be positive")
    private Long questionId;

    @Schema(description = "The answer to the question", example = "I have 5 years of experience with Java and Spring Boot")
    private String answer;

    @Schema(description = "Date and time when the answer was created", accessMode = Schema.AccessMode.READ_ONLY)
    private ZonedDateTime createdAt;
}

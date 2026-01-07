package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User Job Preference Data Transfer Object for career portal connect feature")
public class UserJobPreferenceDTO {

    @Schema(description = "Preference ID - auto-generated", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "User email address", example = "john.doe@example.com", required = true)
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    private String email;

    @Schema(description = "List of selected job category IDs", example = "[1, 2, 3]", required = true)
    @NotEmpty(message = "At least one job category must be selected")
    private List<Long> categoryIds;

    @Schema(description = "Whether the user has accepted the privacy consent", example = "true", required = true)
    private Boolean consentAccepted;

    @Schema(description = "Timestamp when consent was accepted", accessMode = Schema.AccessMode.READ_ONLY)
    private ZonedDateTime consentAcceptedAt;

    @Schema(description = "List of category names for display purposes", accessMode = Schema.AccessMode.READ_ONLY)
    private List<String> categoryNames;

    @Schema(description = "Created timestamp", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime createdAt;
}


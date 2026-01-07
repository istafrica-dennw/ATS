package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Job Category Data Transfer Object")
public class JobCategoryDTO {

    @Schema(description = "Category ID - auto-generated", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "Category name", example = "Engineering", required = true)
    @NotBlank(message = "Category name cannot be blank")
    @Size(max = 100, message = "Category name cannot exceed 100 characters")
    private String name;

    @Schema(description = "Category description", example = "Software development, DevOps, and technical roles")
    private String description;

    @Schema(description = "Hex color code for UI display", example = "#3b82f6")
    private String color;

    @Schema(description = "Whether the category is active", example = "true")
    private Boolean isActive;
}



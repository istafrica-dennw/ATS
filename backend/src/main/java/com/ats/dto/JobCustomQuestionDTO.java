package com.ats.dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import com.ats.model.QuestionType;

@Data
@NoArgsConstructor
@Setter
@Getter
public class JobCustomQuestionDTO {

    @Schema(
        description = "Custom question ID - auto-generated - read-only",
        example = "1",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private Long id;
    
    @Schema(
        description = "ID of the job this question belongs to",
        example = "42",
        required = true
    )
    @NotNull(message = "Job ID cannot be null")
    private Long jobId;
    
    @Schema(
        description = "The text of the custom question",
        example = "Describe your experience with Java Spring Boot",
        required = true
    )
    @NotBlank(message = "Question text cannot be blank")
    private String questionText;
    
    @Schema(
        description = "Type of question (e.g., TEXT, MULTIPLE_CHOICE, YES_NO, RATING)",
        example = "MULTIPLE_CHOICE",
        required = true
    )
    @NotNull(message = "Question type cannot be null")
    private QuestionType questionType;
    
    @Schema(
        description = "Available options for multiple choice questions",
        example = "[\"0-1 years\", \"1-3 years\", \"3-5 years\", \"5+ years\"]"
    )
    private List<String> options;
    
    @Schema(
        description = "Whether this question is required to be answered",
        example = "true",
        defaultValue = "false"
    )
    private Boolean required = false;
    
    @Schema(
        description = "Order/position of this question in the list",
        example = "1"
    )
    private Integer displayOrder;
    
    @Schema(
        description = "Maximum character limit for text answers",
        example = "500"
    )
    private Integer maxCharacterLimit;
    
    @Schema(
        description = "Whether this question is currently active",
        example = "true",
        defaultValue = "true"
    )
    private Boolean active = true;
}

package com.ats.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name="job_custom_questions")
@Getter
@Setter
@NoArgsConstructor
public class JobCustomQuestion extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    @NotNull(message = "Job cannot be null")
    private Job job;
    
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Question text cannot be blank")
    private String questionText;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    @NotNull(message = "Question type cannot be null")
    private QuestionType questionType;
    
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;
    
    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    @Column(name = "options", columnDefinition = "TEXT[]")
    private List<String> options;
}




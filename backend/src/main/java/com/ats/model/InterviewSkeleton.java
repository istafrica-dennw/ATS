package com.ats.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.util.List;

@Entity
@Table(name = "interview_skeletons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSkeleton extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Type(JsonType.class)
    @Column(name = "focus_areas", columnDefinition = "jsonb", nullable = false)
    private List<FocusArea> focusAreas;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusArea {
        private String title;
        private String description;
        private double rating;
    }
} 
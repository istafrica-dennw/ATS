package com.ats.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "skeleton_job_associations")
@Getter
@Setter
@NoArgsConstructor
public class SkeletonJobAssociation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skeleton_id", nullable = false)
    private InterviewSkeleton skeleton;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public SkeletonJobAssociation(InterviewSkeleton skeleton, Job job, User createdBy) {
        this.skeleton = skeleton;
        this.job = job;
        this.createdBy = createdBy;
    }
}
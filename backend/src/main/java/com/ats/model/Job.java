package com.ats.model;

import java.time.LocalDate;
import java.util.List;

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
import lombok.Setter;

@Entity
@Table(name="jobs")
@Getter
@Setter
public class Job extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private JobCategory category;
    @Column(nullable = false, unique = false)
    @NotBlank (message="Title can't be blank")
    @NotNull (message="Title can't be Null")
    private String title;

    @NotNull (message="Location can't be Null")
    private String Location;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private JobStatus jobStatus;
    

    @Enumerated(EnumType.STRING)
    @Column(name = "Work_setting", nullable = false)
    private WorkSetting workSetting;

    @Column(name = "department")
    private String department;
    
    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Column(name = "salary_range")
    private String salaryRange;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(name = "skills", columnDefinition = "TEXT[]")
    private List <String>  skills;
    
    @Column(name = "region", length = 10)
    private String region;
    
    @Column(name = "expiration_date")
    private LocalDate expirationDate;
    
}

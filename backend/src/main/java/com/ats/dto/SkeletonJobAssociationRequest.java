package com.ats.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SkeletonJobAssociationRequest {
    
    @NotNull(message = "Skeleton ID is required")
    private Long skeletonId;
    
    @NotNull(message = "Job IDs are required")
    private List<Long> jobIds;
}
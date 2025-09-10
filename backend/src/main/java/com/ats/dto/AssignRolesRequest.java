package com.ats.dto;

import com.ats.model.Role;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignRolesRequest {
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotEmpty(message = "At least one role is required")
    private List<Role> roles;
    
    private Role primaryRole;
}
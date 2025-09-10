package com.ats.dto;

import com.ats.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    private Role role;
    private String displayName;
    private boolean isPrimary;
    private boolean isCurrent;
    
    public static RoleDTO fromRole(Role role) {
        return RoleDTO.builder()
            .role(role)
            .displayName(getDisplayName(role))
            .build();
    }
    
    public static String getDisplayName(Role role) {
        switch (role) {
            case ADMIN:
                return "Administrator";
            case HIRING_MANAGER:
                return "Hiring Manager";
            case INTERVIEWER:
                return "Interviewer";
            case CANDIDATE:
                return "Candidate";
            default:
                return role.toString();
        }
    }
}
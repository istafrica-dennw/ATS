package com.ats.dto;

import com.ats.model.ConversationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private Long adminId;
    private String adminName;
    private ConversationStatus status;
    private String createdAt;
    private String updatedAt;
} 
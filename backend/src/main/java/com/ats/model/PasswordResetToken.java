package com.ats.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Entity to track password reset tokens")
public class PasswordResetToken extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    @Schema(description = "Unique token used for password reset", example = "1a434ada-182c-4977-b2dc-86622bf94539")
    private String token;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Schema(description = "User associated with this reset token")
    private User user;
    
    @Column(nullable = false)
    @Schema(description = "Date and time when this token expires", example = "2023-05-21T14:30:00")
    private LocalDateTime expiryDate;
    
    @Column(name = "is_used")
    @Schema(description = "Flag indicating if this token has been used", example = "false")
    private Boolean isUsed = false;
    
    @Schema(description = "Checks if the token is expired based on current time")
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
} 
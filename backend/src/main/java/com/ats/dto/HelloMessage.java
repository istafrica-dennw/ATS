package com.ats.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Hello World Message")
public class HelloMessage {
    @Schema(description = "The message content", example = "Hello World")
    private String message;
} 
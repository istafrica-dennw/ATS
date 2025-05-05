package com.ats.controller;

import com.ats.dto.ApiResponse;
import com.ats.dto.HelloMessage;
import com.ats.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test/hello")
@Tag(name = "Hello World", description = "Hello World APIs")
public class HelloController {

    private static final Logger logger = LoggerFactory.getLogger(HelloController.class);
    private final MessageService messageService;

    @Autowired
    public HelloController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Set Hello World message", description = "Sets a new Hello World message")
    public ApiResponse<HelloMessage> setMessage(@RequestBody HelloMessage helloMessage) {
        logger.info("Received message update request: {}", helloMessage.getMessage());
        messageService.saveMessage(helloMessage.getMessage());
        return ApiResponse.success(helloMessage);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get Hello World message", description = "Retrieves the current Hello World message")
    public ApiResponse<HelloMessage> getMessage() {
        String message = messageService.getLatestMessage() != null 
            ? messageService.getLatestMessage().getContent() 
            : "Hello World";
        logger.info("Returning message: {}", message);
        return ApiResponse.success(new HelloMessage(message));
    }
} 
package com.ats.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello, world!");
        response.put("status", "success");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/error-test")
    public ResponseEntity<Map<String, String>> triggerError() {
        // Deliberately throw an exception to test error handling
        throw new RuntimeException("Test exception for error handling");
    }
} 
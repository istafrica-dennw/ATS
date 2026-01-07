package com.ats.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/entries")
public class EntryController {

    @GetMapping
    public Map<String, Object> getEntries(@AuthenticationPrincipal Jwt jwt) {
        // 'sub' is the unique User ID from IAA
        String userId = jwt.getSubject();
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("user_id", userId);
        response.put("data", "This is protected data from the ATS backend");
        
        // In a real app, you would query your DB here:
        // return entryRepository.findByUserId(userId);
        
        return response;
    }
}
package com.ats.service.impl;

import com.ats.service.HealthService;
import org.springframework.stereotype.Service;

@Service
public class HealthServiceImpl implements HealthService {
    
    @Override
    public String checkHealth() {
        return "Service is healthy";
    }
} 
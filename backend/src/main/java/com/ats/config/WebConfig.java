package com.ats.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:3001")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            .allowedHeaders("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With",
                "Access-Control-Request-Method", "Access-Control-Request-Headers")
            .exposedHeaders("Authorization", "Content-Type", "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials")
            .allowCredentials(true)
            .maxAge(3600);
    }
} 
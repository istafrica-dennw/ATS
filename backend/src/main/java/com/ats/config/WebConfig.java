package com.ats.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.frontend.cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Add the mappings directly to the registry
        if ("*".equals(allowedOrigins)) {
            // When using allowedOrigins with "*", Spring disables credentials
            // Instead, use a pattern to allow all origins while keeping credentials
            registry.addMapping("/**")
                   .allowedOriginPatterns("*")
                   .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                   .allowedHeaders("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With",
                       "Access-Control-Request-Method", "Access-Control-Request-Headers")
                   .exposedHeaders("Authorization", "Content-Type", "Access-Control-Allow-Origin",
                       "Access-Control-Allow-Credentials")
                   .allowCredentials(true)
                   .maxAge(3600);
        } else {
            registry.addMapping("/**")
                   .allowedOrigins(allowedOrigins.split(","))
                   .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                   .allowedHeaders("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With",
                       "Access-Control-Request-Method", "Access-Control-Request-Headers")
                   .exposedHeaders("Authorization", "Content-Type", "Access-Control-Allow-Origin",
                       "Access-Control-Allow-Credentials")
                   .allowCredentials(true)
                   .maxAge(3600);
        }
    }
} 
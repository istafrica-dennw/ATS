package com.ats.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    @Value("${app.frontend.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

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

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /api/files/profile-pictures/** to the file system location
        Path profilePicturesPath = Paths.get(uploadDir, "profile-pictures").toAbsolutePath().normalize();
        String profilePicturesLocation = profilePicturesPath.toUri().toString();
        
        // Ensure the location ends with a trailing slash for directory URLs
        if (!profilePicturesLocation.endsWith("/")) {
            profilePicturesLocation += "/";
        }
        
        logger.info("Configuring profile pictures path: {}", profilePicturesPath);
        logger.info("Profile pictures location URI: {}", profilePicturesLocation);
        
        registry.addResourceHandler("/api/files/profile-pictures/**")
                .addResourceLocations(profilePicturesLocation)
                .setCachePeriod(3600);
    }
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Also explicitly add CORS mapping for static resources
                registry.addMapping("/api/files/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "OPTIONS")
                        .allowedHeaders("*")
                        .maxAge(3600);
            }
        };
    }
} 
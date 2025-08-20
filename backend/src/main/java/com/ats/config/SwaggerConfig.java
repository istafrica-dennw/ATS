package com.ats.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("ATS System API")
                .description("API documentation for the Applicant Tracking System. Includes endpoints for user authentication, profile management, password management, job applications, interviews, and administrative features.")
                .version("1.0.0")
                .license(new License()
                    .name("Apache 2.0")
                    .url("http://springdoc.org")))
            .servers(Arrays.asList(
                new Server().url("https://ist.africa:8080").description("Production Server"),
                new Server().url("http://localhost:8080").description("Local Development Server")
            ))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", 
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Enter the JWT token obtained from the login API. The value should be: Bearer <JWT Token>")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .tags(Arrays.asList(
                new Tag().name("Authentication & Profile").description("Authentication, registration, profile management, and password management operations"),
                new Tag().name("User Management").description("Admin operations for managing users"),
                new Tag().name("Files").description("File upload and management operations"),
                new Tag().name("Security").description("Security operations including password changes and account deactivation")
            ));
    }
} 
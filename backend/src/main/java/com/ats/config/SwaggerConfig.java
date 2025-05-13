package com.ats.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
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
                .description("API documentation for the Applicant Tracking System")
                .version("1.0.0")
                .license(new License()
                    .name("Apache 2.0")
                    .url("http://springdoc.org")))
            .servers(Arrays.asList(
                new Server().url("http://localhost:8080").description("Local Development Server"),
                new Server().url("http://api.ats-system.com").description("Production Server")
            ))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", 
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Enter the JWT token obtained from the login API. The value should be: Bearer <JWT Token>")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
} 
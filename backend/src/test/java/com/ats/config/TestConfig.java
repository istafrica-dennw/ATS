package com.ats.config;

import com.ats.service.EmailService;
import com.ats.socket.ChatSocketHandler;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.SpringAnnotationScanner;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import static org.mockito.Mockito.mock;

@TestConfiguration
public class TestConfig {

    // Mock EmailService so we don't need to configure email for tests
    @MockBean
    private EmailService emailService;

    @Bean
    @Primary
    public SocketIOServer mockSocketIOServer() {
        return mock(SocketIOServer.class);
    }

    @Bean
    @Primary
    public SpringAnnotationScanner mockSpringAnnotationScanner() {
        return mock(SpringAnnotationScanner.class);
    }

    @Bean
    @Primary
    public ChatSocketHandler mockChatSocketHandler() {
        return mock(ChatSocketHandler.class);
    }
} 
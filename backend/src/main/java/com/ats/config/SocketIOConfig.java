package com.ats.config;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.SpringAnnotationScanner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SocketIOConfig {

    @Value("${socketio.host:0.0.0.0}")
    private String host;

    @Value("${socketio.port:9092}")
    private Integer port;

    @Value("${socketio.bossCount:1}")
    private int bossCount;

    @Value("${socketio.workCount:100}")
    private int workCount;

    @Value("${socketio.allowCustomRequests:false}")
    private boolean allowCustomRequests;

    @Value("${socketio.upgradeTimeout:10000}")
    private int upgradeTimeout;

    @Value("${socketio.pingTimeout:60000}")
    private int pingTimeout;

    @Value("${socketio.pingInterval:25000}")
    private int pingInterval;

    public SocketIOConfig() {
        log.info("🔧 SocketIOConfig constructor called - Creating configuration component");
    }

    @Bean
    public SocketIOServer socketIOServer() {
        log.info("🏭 Creating SocketIOServer bean...");
        log.info("🔍 Host value from @Value: {}", host);
        log.info("🔍 Port value from @Value: {}", port);
        
        Configuration config = new Configuration();
        config.setHostname("0.0.0.0"); // Force to 0.0.0.0
        config.setPort(port);
        config.setBossThreads(bossCount);
        config.setWorkerThreads(workCount);
        config.setAllowCustomRequests(allowCustomRequests);
        config.setUpgradeTimeout(upgradeTimeout);
        config.setPingTimeout(pingTimeout);
        config.setPingInterval(pingInterval);
        
        // Enable CORS for frontend integration
        config.setOrigin("*");
        
        // Add authentication if needed (can be enhanced later)
        // config.setAuthorizationListener(handshakeData -> {
        //     // Add JWT token validation here if needed
        //     return true;
        // });

        SocketIOServer server = new SocketIOServer(config);
        
        log.info("✅ SocketIOServer bean created on 0.0.0.0:{}", port);
        return server;
    }

    @Bean
    public SpringAnnotationScanner springAnnotationScanner(SocketIOServer socketServer) {
        log.info("🔍 Creating SpringAnnotationScanner bean...");
        SpringAnnotationScanner scanner = new SpringAnnotationScanner(socketServer);
        log.info("✅ SpringAnnotationScanner bean created");
        return scanner;
    }
} 
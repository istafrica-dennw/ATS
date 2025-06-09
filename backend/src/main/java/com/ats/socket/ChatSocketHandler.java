package com.ats.socket;

import com.ats.dto.ChatMessageDTO;
import com.ats.dto.ConversationDTO;
import com.ats.model.ConversationStatus;
import com.ats.service.SocketChatService;
import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class ChatSocketHandler {

    private final SocketIOServer server;
    private final SocketChatService socketChatService;
    
    // Track active connections: conversationId -> clientId
    private final Map<Long, String> activeConversations = new ConcurrentHashMap<>();
    // Track client to user mapping: clientId -> userId
    private final Map<String, Long> clientUserMap = new ConcurrentHashMap<>();
    // Track client to conversation mapping: clientId -> conversationId
    private final Map<String, Long> clientConversationMap = new ConcurrentHashMap<>();

    @Autowired
    public ChatSocketHandler(SocketIOServer server, SocketChatService socketChatService) {
        log.info("🎯 ChatSocketHandler constructor called - Injecting dependencies");
        this.server = server;
        this.socketChatService = socketChatService;
        log.info("✅ ChatSocketHandler dependencies injected successfully");
    }

    @PostConstruct
    public void startServer() {
        log.info("🚀 @PostConstruct - Starting Socket.IO server...");
        server.start();
        log.info("🎉 Socket.IO server started successfully and listening for connections");
    }

    @PreDestroy
    public void stopServer() {
        server.stop();
        log.info("Socket.IO server stopped");
    }

    @OnConnect
    public void onConnect(SocketIOClient client) {
        log.info("Client connected: {}", client.getSessionId());
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        String clientId = client.getSessionId().toString();
        log.info("Client disconnected: {}", clientId);
        
        // Get conversation and user info before cleanup
        Long conversationId = clientConversationMap.get(clientId);
        Long userId = clientUserMap.get(clientId);
        
        // Just cleanup tracking maps - don't close conversation on disconnect
        // Conversations should only be closed when explicitly requested
        clientUserMap.remove(clientId);
        clientConversationMap.remove(clientId);
        if (conversationId != null) {
            activeConversations.remove(conversationId);
        }
        
        log.info("Client {} disconnected and cleaned up tracking for user {} and conversation {}", 
                clientId, userId, conversationId);
    }

    @OnEvent("join_chat")
    public void onJoinChat(SocketIOClient client, Map<String, Object> data, AckRequest ackRequest) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            String clientId = client.getSessionId().toString();
            
            log.info("User {} joining chat", userId);
            
            // Store client-user mapping
            clientUserMap.put(clientId, userId);
            
            // Get or create conversation and messages through transactional service
            SocketChatService.ConversationJoinResult result = socketChatService.joinChat(userId);
            
            // Store client-conversation mapping
            clientConversationMap.put(clientId, result.getConversation().getId());
            activeConversations.put(result.getConversation().getId(), clientId);
            
            // Join client to conversation room
            client.joinRoom("conversation_" + result.getConversation().getId());
            
            // If this is a newly created conversation, notify all admins
            if (result.isNewConversation()) {
                log.info("Notifying admins about new unassigned conversation {}", result.getConversation().getId());
                server.getBroadcastOperations().sendEvent("new_unassigned_conversation", result.getConversation());
            }
            
            // Acknowledge join with conversation data
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of(
                    "success", true,
                    "conversation", result.getConversation(),
                    "messages", result.getMessages()
                ));
            }
            
            log.info("User {} joined conversation {}", userId, result.getConversation().getId());
            
        } catch (Exception e) {
            log.error("Error in join_chat: {}", e.getMessage());
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of("success", false, "error", e.getMessage()));
            }
        }
    }

    @OnEvent("admin_take_conversation")
    public void onAdminTakeConversation(SocketIOClient client, Map<String, Object> data, AckRequest ackRequest) {
        try {
            Long adminId = Long.valueOf(data.get("adminId").toString());
            Long conversationId = Long.valueOf(data.get("conversationId").toString());
            String clientId = client.getSessionId().toString();
            
            log.info("Admin {} taking conversation {}", adminId, conversationId);
            
            // Take conversation through transactional service
            ConversationDTO conversationDTO = socketChatService.takeConversation(adminId, conversationId);
            
            // Store mappings
            clientUserMap.put(clientId, adminId);
            clientConversationMap.put(clientId, conversationId);
            
            // Join admin to conversation room
            client.joinRoom("conversation_" + conversationId);
            
            // Notify all participants about admin assignment
            server.getRoomOperations("conversation_" + conversationId)
                .sendEvent("admin_assigned", conversationDTO);
            
            // Notify all admins that this conversation was taken
            server.getBroadcastOperations().sendEvent("conversation_taken", Map.of(
                "conversationId", conversationId,
                "adminId", adminId
            ));
            
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of(
                    "success", true,
                    "conversation", conversationDTO
                ));
            }
            
            log.info("Admin {} successfully assigned to conversation {}", adminId, conversationId);
            
        } catch (Exception e) {
            log.error("Error in admin_take_conversation: {}", e.getMessage());
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of("success", false, "error", e.getMessage()));
            }
        }
    }

    @OnEvent("send_message")
    public void onSendMessage(SocketIOClient client, Map<String, Object> data, AckRequest ackRequest) {
        try {
            String clientId = client.getSessionId().toString();
            Long userId = clientUserMap.get(clientId);
            Long conversationId = clientConversationMap.get(clientId);
            String content = data.get("content").toString();
            
            if (userId == null || conversationId == null) {
                throw new RuntimeException("User not properly connected to conversation");
            }
            
            log.info("Sending message from user {} to conversation {}", userId, conversationId);
            
            // Send message through transactional service
            ChatMessageDTO messageDTO = socketChatService.sendMessage(conversationId, userId, content);
            
            // Broadcast message to all participants in the conversation
            server.getRoomOperations("conversation_" + conversationId)
                .sendEvent("new_message", messageDTO);
            
            // Acknowledge to sender
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of(
                    "success", true,
                    "message", messageDTO
                ));
            }
            
            log.info("Message sent successfully: {}", messageDTO.getId());
            
        } catch (Exception e) {
            log.error("Error in send_message: {}", e.getMessage());
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of("success", false, "error", e.getMessage()));
            }
        }
    }

    @OnEvent("close_conversation")
    public void onCloseConversation(SocketIOClient client, Map<String, Object> data, AckRequest ackRequest) {
        try {
            String clientId = client.getSessionId().toString();
            Long conversationId = clientConversationMap.get(clientId);
            Long userId = clientUserMap.get(clientId);
            
            if (conversationId == null) {
                throw new RuntimeException("No active conversation found");
            }
            
            log.info("Closing conversation {} by user {}", conversationId, userId);
            
            // Close conversation through transactional service
            ConversationDTO closedConversation = socketChatService.closeConversation(conversationId);
            
            // Notify all participants
            notifyConversationClosed(conversationId, userId);
            
            // Remove from tracking
            clientConversationMap.remove(clientId);
            activeConversations.remove(conversationId);
            
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of(
                    "success", true,
                    "conversation", closedConversation
                ));
            }
            
            log.info("Conversation {} closed successfully", conversationId);
            
        } catch (Exception e) {
            log.error("Error in close_conversation: {}", e.getMessage());
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of("success", false, "error", e.getMessage()));
            }
        }
    }

    @OnEvent("get_unassigned_conversations")
    public void onGetUnassignedConversations(SocketIOClient client, Map<String, Object> data, AckRequest ackRequest) {
        try {
            log.info("Fetching unassigned conversations for admin");
            
            // Get unassigned conversations through transactional service
            List<ConversationDTO> conversationDTOs = socketChatService.getUnassignedConversations();
            
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of(
                    "success", true,
                    "conversations", conversationDTOs
                ));
            }
            
        } catch (Exception e) {
            log.error("Error fetching unassigned conversations: {}", e.getMessage());
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of("success", false, "error", e.getMessage()));
            }
        }
    }

    @OnEvent("close_all_admin_conversations")
    public void onCloseAllAdminConversations(SocketIOClient client, Map<String, Object> data, AckRequest ackRequest) {
        try {
            Long adminId = Long.valueOf(data.get("adminId").toString());
            log.info("Closing all conversations for admin {}", adminId);
            
            // Get all active conversations for this admin
            List<ConversationDTO> closedConversations = socketChatService.closeAllAdminConversations(adminId);
            
            // Notify all participants of closed conversations
            for (ConversationDTO conversation : closedConversations) {
                notifyConversationClosed(conversation.getId(), adminId);
            }
            
            // Clean up tracking for this admin
            String clientId = client.getSessionId().toString();
            clientUserMap.remove(clientId);
            clientConversationMap.remove(clientId);
            
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of(
                    "success", true,
                    "closedConversations", closedConversations
                ));
            }
            
            log.info("Closed {} conversations for admin {}", closedConversations.size(), adminId);
            
        } catch (Exception e) {
            log.error("Error closing all admin conversations: {}", e.getMessage());
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of("success", false, "error", e.getMessage()));
            }
        }
    }

    private void notifyConversationClosed(Long conversationId, Long closedByUserId) {
        ConversationDTO conversationDTO = new ConversationDTO();
        conversationDTO.setId(conversationId);
        conversationDTO.setStatus(ConversationStatus.CLOSED);
        
        server.getRoomOperations("conversation_" + conversationId)
            .sendEvent("conversation_closed", Map.of(
                "conversation", conversationDTO,
                "closedBy", closedByUserId,
                "message", "Conversation has been closed and cannot be reopened."
            ));
    }
} 
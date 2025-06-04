package com.ats.socket;

import com.ats.dto.ChatMessageDTO;
import com.ats.dto.ConversationDTO;
import com.ats.model.Chat;
import com.ats.model.Conversation;
import com.ats.model.ConversationStatus;
import com.ats.model.User;
import com.ats.service.ChatService;
import com.ats.service.ConversationService;
import com.ats.service.UserService;
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
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class ChatSocketHandler {

    private final SocketIOServer server;
    private final ChatService chatService;
    private final ConversationService conversationService;
    private final UserService userService;
    
    // Track active connections: conversationId -> clientId
    private final Map<Long, String> activeConversations = new ConcurrentHashMap<>();
    // Track client to user mapping: clientId -> userId
    private final Map<String, Long> clientUserMap = new ConcurrentHashMap<>();
    // Track client to conversation mapping: clientId -> conversationId
    private final Map<String, Long> clientConversationMap = new ConcurrentHashMap<>();

    @Autowired
    public ChatSocketHandler(SocketIOServer server, 
                           ChatService chatService, 
                           ConversationService conversationService,
                           UserService userService) {
        log.info("🎯 ChatSocketHandler constructor called - Injecting dependencies");
        this.server = server;
        this.chatService = chatService;
        this.conversationService = conversationService;
        this.userService = userService;
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
        
        if (conversationId != null) {
            // Close conversation permanently when user disconnects
            try {
                conversationService.closeConversation(conversationId);
                log.info("Conversation {} closed due to disconnect", conversationId);
                
                // Notify other participants that conversation is closed
                notifyConversationClosed(conversationId, userId);
                
            } catch (Exception e) {
                log.error("Error closing conversation on disconnect: {}", e.getMessage());
            }
        }
        
        // Cleanup tracking maps
        clientUserMap.remove(clientId);
        clientConversationMap.remove(clientId);
        if (conversationId != null) {
            activeConversations.remove(conversationId);
        }
    }

    @OnEvent("join_chat")
    public void onJoinChat(SocketIOClient client, Map<String, Object> data, AckRequest ackRequest) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            String clientId = client.getSessionId().toString();
            
            log.info("User {} joining chat", userId);
            
            // Store client-user mapping
            clientUserMap.put(clientId, userId);
            
            // Get or create conversation for candidate
            Conversation conversation = conversationService.getOrCreateConversationForCandidate(userId);
            
            // Store client-conversation mapping
            clientConversationMap.put(clientId, conversation.getId());
            activeConversations.put(conversation.getId(), clientId);
            
            // Join client to conversation room
            client.joinRoom("conversation_" + conversation.getId());
            
            // Send conversation info and message history
            ConversationDTO conversationDTO = mapToConversationDTO(conversation);
            List<Chat> messages = chatService.getMessagesByConversation(conversation.getId());
            List<ChatMessageDTO> messageDTOs = messages.stream()
                .map(this::mapToChatMessageDTO)
                .toList();
            
            // Acknowledge join with conversation data
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of(
                    "success", true,
                    "conversation", conversationDTO,
                    "messages", messageDTOs
                ));
            }
            
            log.info("User {} joined conversation {}", userId, conversation.getId());
            
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
            
            // Check if conversation is already assigned
            Conversation conversation = conversationService.getConversationById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
            
            if (conversation.getAdmin() != null) {
                // Conversation already assigned to another admin
                if (ackRequest.isAckRequested()) {
                    ackRequest.sendAckData(Map.of(
                        "success", false, 
                        "error", "Conversation already assigned to another admin"
                    ));
                }
                return;
            }
            
            // Assign admin to conversation
            Conversation updatedConversation = conversationService.assignAdminToConversation(conversationId, adminId);
            
            // Store mappings
            clientUserMap.put(clientId, adminId);
            clientConversationMap.put(clientId, conversationId);
            
            // Join admin to conversation room
            client.joinRoom("conversation_" + conversationId);
            
            // Notify all participants about admin assignment
            ConversationDTO conversationDTO = mapToConversationDTO(updatedConversation);
            server.getRoomOperations("conversation_" + conversationId)
                .sendEvent("admin_assigned", conversationDTO);
            
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
            
            // Send message through service
            Chat savedMessage = chatService.sendMessage(conversationId, userId, content);
            
            // Create DTO for broadcast
            ChatMessageDTO messageDTO = mapToChatMessageDTO(savedMessage);
            
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
            
            log.info("Message sent successfully: {}", savedMessage.getId());
            
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
            
            // Close conversation permanently
            Conversation closedConversation = conversationService.closeConversation(conversationId);
            
            // Notify all participants
            notifyConversationClosed(conversationId, userId);
            
            // Remove from tracking
            clientConversationMap.remove(clientId);
            activeConversations.remove(conversationId);
            
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData(Map.of(
                    "success", true,
                    "conversation", mapToConversationDTO(closedConversation)
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
            
            List<Conversation> unassignedConversations = conversationService.getUnassignedConversations();
            List<ConversationDTO> conversationDTOs = unassignedConversations.stream()
                .map(this::mapToConversationDTO)
                .toList();
            
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

    private ChatMessageDTO mapToChatMessageDTO(Chat chat) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(chat.getId());
        dto.setConversationId(chat.getConversation().getId());
        dto.setSenderId(chat.getSender().getId());
        dto.setSenderName(chat.getSender().getFirstName() + " " + chat.getSender().getLastName());
        dto.setSenderRole(chat.getSender().getRole().toString());
        dto.setContent(chat.getContent());
        dto.setCreatedAt(chat.getCreatedAt().atZone(ZoneId.systemDefault()));
        dto.setMessageType("text");
        return dto;
    }

    private ConversationDTO mapToConversationDTO(Conversation conversation) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setCandidateId(conversation.getCandidate().getId());
        dto.setCandidateName(conversation.getCandidate().getFirstName() + " " + conversation.getCandidate().getLastName());
        
        if (conversation.getAdmin() != null) {
            dto.setAdminId(conversation.getAdmin().getId());
            dto.setAdminName(conversation.getAdmin().getFirstName() + " " + conversation.getAdmin().getLastName());
        }
        
        dto.setStatus(conversation.getStatus());
        dto.setCreatedAt(conversation.getCreatedAt().atZone(ZoneId.systemDefault()));
        dto.setUpdatedAt(conversation.getUpdatedAt().atZone(ZoneId.systemDefault()));
        return dto;
    }
} 
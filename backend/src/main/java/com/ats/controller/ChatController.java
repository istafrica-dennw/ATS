package com.ats.controller;

import com.ats.dto.ChatMessageDTO;
import com.ats.dto.ConversationDTO;
import com.ats.model.Chat;
import com.ats.model.Conversation;
import com.ats.service.ChatService;
import com.ats.service.ConversationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final ConversationService conversationService;

    @Autowired
    public ChatController(ChatService chatService, ConversationService conversationService) {
        this.chatService = chatService;
        this.conversationService = conversationService;
    }

    @GetMapping("/conversations/unassigned")
    public ResponseEntity<List<ConversationDTO>> getUnassignedConversations() {
        log.info("Fetching unassigned conversations");
        
        List<Conversation> conversations = conversationService.getUnassignedConversations();
        
        // Return all unassigned conversations (no message filtering)
        List<ConversationDTO> conversationDTOs = conversations.stream()
            .map(this::mapToConversationDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(conversationDTOs);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getConversationMessages(@PathVariable Long conversationId) {
        log.info("Fetching messages for conversation {}", conversationId);
        
        List<Chat> messages = chatService.getMessagesByConversation(conversationId);
        List<ChatMessageDTO> messageDTOs = messages.stream()
            .map(this::mapToChatMessageDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(messageDTOs);
    }

    @GetMapping("/conversations/candidate/{candidateId}")
    public ResponseEntity<ConversationDTO> getCandidateConversation(@PathVariable Long candidateId) {
        log.info("Getting conversation for candidate {}", candidateId);
        
        Conversation conversation = conversationService.getOrCreateConversationForCandidate(candidateId);
        ConversationDTO conversationDTO = mapToConversationDTO(conversation);
        
        return ResponseEntity.ok(conversationDTO);
    }

    @PostMapping("/conversations/{conversationId}/assign/{adminId}")
    public ResponseEntity<ConversationDTO> assignAdminToConversation(
            @PathVariable Long conversationId, 
            @PathVariable Long adminId) {
        log.info("Assigning admin {} to conversation {}", adminId, conversationId);
        
        Conversation conversation = conversationService.assignAdminToConversation(conversationId, adminId);
        ConversationDTO conversationDTO = mapToConversationDTO(conversation);
        
        return ResponseEntity.ok(conversationDTO);
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<ConversationDTO> closeConversation(@PathVariable Long conversationId) {
        log.info("Closing conversation {}", conversationId);
        
        Conversation conversation = conversationService.closeConversation(conversationId);
        ConversationDTO conversationDTO = mapToConversationDTO(conversation);
        
        return ResponseEntity.ok(conversationDTO);
    }

    private ChatMessageDTO mapToChatMessageDTO(Chat chat) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(chat.getId());
        dto.setConversationId(chat.getConversation().getId());
        dto.setSenderId(chat.getSender().getId());
        dto.setSenderName(chat.getSender().getFirstName() + " " + chat.getSender().getLastName());
        dto.setSenderRole(chat.getSender().getRole().toString());
        dto.setContent(chat.getContent());
        dto.setCreatedAt(chat.getCreatedAt().atZone(ZoneId.systemDefault()).toString());
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
        dto.setCreatedAt(conversation.getCreatedAt().atZone(ZoneId.systemDefault()).toString());
        dto.setUpdatedAt(conversation.getUpdatedAt().atZone(ZoneId.systemDefault()).toString());
        return dto;
    }
} 
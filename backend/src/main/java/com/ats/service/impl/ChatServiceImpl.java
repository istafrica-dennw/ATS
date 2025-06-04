package com.ats.service.impl;

import com.ats.model.Chat;
import com.ats.model.Conversation;
import com.ats.model.User;
import com.ats.repository.ChatRepository;
import com.ats.repository.ConversationRepository;
import com.ats.repository.UserRepository;
import com.ats.service.ChatService;
import com.ats.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Autowired
    public ChatServiceImpl(ChatRepository chatRepository, 
                          ConversationRepository conversationRepository,
                          UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Chat sendMessage(Long conversationId, Long senderId, String content) {
        log.info("Sending message from user {} to conversation {}", senderId, conversationId);
        
        // Validate conversation exists
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + conversationId));
        
        // Validate sender exists
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + senderId));
        
        // Validate sender is part of the conversation
        if (!conversation.getCandidate().getId().equals(senderId) && 
            (conversation.getAdmin() == null || !conversation.getAdmin().getId().equals(senderId))) {
            throw new IllegalArgumentException("User is not authorized to send messages in this conversation");
        }
        
        // Create and save the chat message
        Chat chat = new Chat();
        chat.setConversation(conversation);
        chat.setSender(sender);
        chat.setContent(content);
        
        Chat savedChat = chatRepository.save(chat);
        log.info("Message sent successfully with ID: {}", savedChat.getId());
        
        return savedChat;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Chat> getMessagesByConversation(Long conversationId) {
        log.debug("Fetching messages for conversation ID: {}", conversationId);
        
        // Validate conversation exists
        if (!conversationRepository.existsById(conversationId)) {
            throw new ResourceNotFoundException("Conversation not found with ID: " + conversationId);
        }
        
        return chatRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Chat> getMessagesBySender(Long senderId) {
        log.debug("Fetching messages for sender ID: {}", senderId);
        
        // Validate sender exists
        if (!userRepository.existsById(senderId)) {
            throw new ResourceNotFoundException("User not found with ID: " + senderId);
        }
        
        return chatRepository.findBySenderId(senderId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Chat> getChatById(Long chatId) {
        log.debug("Fetching chat message with ID: {}", chatId);
        return chatRepository.findById(chatId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Chat> getMessagesByConversationAndSender(Long conversationId, Long senderId) {
        log.debug("Fetching messages for conversation {} and sender {}", conversationId, senderId);
        
        // Validate inputs
        if (!conversationRepository.existsById(conversationId)) {
            throw new ResourceNotFoundException("Conversation not found with ID: " + conversationId);
        }
        if (!userRepository.existsById(senderId)) {
            throw new ResourceNotFoundException("User not found with ID: " + senderId);
        }
        
        return chatRepository.findByConversationIdAndSenderId(conversationId, senderId);
    }

    @Override
    public boolean deleteMessage(Long chatId) {
        log.info("Deleting chat message with ID: {}", chatId);
        
        if (!chatRepository.existsById(chatId)) {
            throw new ResourceNotFoundException("Chat message not found with ID: " + chatId);
        }
        
        chatRepository.deleteById(chatId);
        log.info("Chat message deleted successfully with ID: {}", chatId);
        
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Chat> getRecentMessages(Long conversationId, int limit, int offset) {
        log.debug("Fetching recent messages for conversation {} with limit {} and offset {}", 
                  conversationId, limit, offset);
        
        // Validate conversation exists
        if (!conversationRepository.existsById(conversationId)) {
            throw new ResourceNotFoundException("Conversation not found with ID: " + conversationId);
        }
        
        // Create pageable with descending order to get most recent first
        Pageable pageable = PageRequest.of(offset / limit, limit, 
                                         Sort.by(Sort.Direction.DESC, "createdAt"));
        
        return chatRepository.findByConversationId(conversationId, pageable).getContent();
    }
} 
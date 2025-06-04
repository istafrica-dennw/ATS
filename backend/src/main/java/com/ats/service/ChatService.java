package com.ats.service;

import com.ats.model.Chat;
import com.ats.model.Conversation;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for managing chat messages
 */
public interface ChatService {
    
    /**
     * Send a new chat message
     * @param conversationId The conversation ID
     * @param senderId The sender's user ID
     * @param content The message content
     * @return Created chat message
     */
    Chat sendMessage(Long conversationId, Long senderId, String content);
    
    /**
     * Get all messages for a conversation
     * @param conversationId The conversation ID
     * @return List of chat messages ordered by creation time
     */
    List<Chat> getMessagesByConversation(Long conversationId);
    
    /**
     * Get all messages sent by a specific user
     * @param senderId The sender's user ID
     * @return List of chat messages
     */
    List<Chat> getMessagesBySender(Long senderId);
    
    /**
     * Get a specific chat message by ID
     * @param chatId The chat message ID
     * @return Optional containing the chat message if found
     */
    Optional<Chat> getChatById(Long chatId);
    
    /**
     * Get messages for a specific conversation and sender
     * @param conversationId The conversation ID
     * @param senderId The sender's user ID
     * @return List of chat messages
     */
    List<Chat> getMessagesByConversationAndSender(Long conversationId, Long senderId);
    
    /**
     * Delete a chat message
     * @param chatId The chat message ID
     * @return true if deleted successfully
     */
    boolean deleteMessage(Long chatId);
    
    /**
     * Get recent messages with pagination
     * @param conversationId The conversation ID
     * @param limit Maximum number of messages to return
     * @param offset Number of messages to skip
     * @return List of recent chat messages
     */
    List<Chat> getRecentMessages(Long conversationId, int limit, int offset);
} 
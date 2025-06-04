package com.ats.service;

import com.ats.model.Conversation;
import com.ats.model.ConversationStatus;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for managing conversations between candidates and admins
 */
public interface ConversationService {
    
    /**
     * Create a new conversation between a candidate and admin
     * @param candidateId The candidate's user ID
     * @param adminId The admin's user ID (optional, can be null initially)
     * @return Created conversation
     */
    Conversation createConversation(Long candidateId, Long adminId);
    
    /**
     * Get or create a conversation for a candidate
     * @param candidateId The candidate's user ID
     * @return Existing or newly created conversation
     */
    Conversation getOrCreateConversationForCandidate(Long candidateId);
    
    /**
     * Assign an admin to a conversation
     * @param conversationId The conversation ID
     * @param adminId The admin's user ID
     * @return Updated conversation
     */
    Conversation assignAdminToConversation(Long conversationId, Long adminId);
    
    /**
     * Update conversation status
     * @param conversationId The conversation ID
     * @param status The new status
     * @return Updated conversation
     */
    Conversation updateConversationStatus(Long conversationId, ConversationStatus status);
    
    /**
     * Get conversation by ID
     * @param conversationId The conversation ID
     * @return Optional containing the conversation if found
     */
    Optional<Conversation> getConversationById(Long conversationId);
    
    /**
     * Get conversations for a specific candidate
     * @param candidateId The candidate's user ID
     * @return List of conversations
     */
    List<Conversation> getConversationsByCandidate(Long candidateId);
    
    /**
     * Get conversations assigned to a specific admin
     * @param adminId The admin's user ID
     * @return List of conversations
     */
    List<Conversation> getConversationsByAdmin(Long adminId);
    
    /**
     * Get conversations by status
     * @param status The conversation status
     * @return List of conversations with the specified status
     */
    List<Conversation> getConversationsByStatus(ConversationStatus status);
    
    /**
     * Get active conversations for an admin
     * @param adminId The admin's user ID
     * @return List of active conversations
     */
    List<Conversation> getActiveConversationsByAdmin(Long adminId);
    
    /**
     * Get all unassigned conversations (admin_id is null)
     * @return List of unassigned conversations
     */
    List<Conversation> getUnassignedConversations();
    
    /**
     * Close a conversation
     * @param conversationId The conversation ID
     * @return Updated conversation with CLOSED status
     */
    Conversation closeConversation(Long conversationId);
    
    /**
     * Reopen a conversation
     * @param conversationId The conversation ID
     * @return Updated conversation with ACTIVE status
     */
    Conversation reopenConversation(Long conversationId);
} 
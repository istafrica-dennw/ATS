package com.ats.service.impl;

import com.ats.model.Conversation;
import com.ats.model.ConversationStatus;
import com.ats.model.User;
import com.ats.repository.ConversationRepository;
import com.ats.repository.UserRepository;
import com.ats.service.ConversationService;
import com.ats.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@Slf4j
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Autowired
    public ConversationServiceImpl(ConversationRepository conversationRepository,
                                 UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Conversation createConversation(Long candidateId, Long adminId) {
        log.info("Creating conversation for candidate {} and admin {}", candidateId, adminId);
        
        // Validate candidate exists
        User candidate = userRepository.findById(candidateId)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with ID: " + candidateId));
        
        // Validate admin exists (if provided)
        User admin = null;
        if (adminId != null) {
            admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));
        }
        
        // Create new conversation
        Conversation conversation = new Conversation();
        conversation.setCandidate(candidate);
        conversation.setAdmin(admin);
        conversation.setStatus(ConversationStatus.ACTIVE);
        
        Conversation savedConversation = conversationRepository.save(conversation);
        log.info("Conversation created successfully with ID: {}", savedConversation.getId());
        
        return savedConversation;
    }

    @Override
    public Conversation getOrCreateConversationForCandidate(Long candidateId) {
        log.debug("Getting or creating conversation for candidate {}", candidateId);
        
        // Try to find existing ACTIVE conversation first
        List<Conversation> activeConversations = conversationRepository.findByCandidateIdAndStatus(candidateId, ConversationStatus.ACTIVE);
        
        if (!activeConversations.isEmpty()) {
            log.debug("Found existing active conversation for candidate {}", candidateId);
            return activeConversations.get(0);
        }
        
        // Create new conversation if no active one exists
        log.debug("Creating new conversation for candidate {}", candidateId);
        return createConversation(candidateId, null);
    }

    @Override
    public Conversation assignAdminToConversation(Long conversationId, Long adminId) {
        log.info("Assigning admin {} to conversation {}", adminId, conversationId);
        
        // Validate conversation exists
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + conversationId));
        
        // Validate admin exists
        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));
        
        // Assign admin and update conversation
        conversation.setAdmin(admin);
        conversation.setStatus(ConversationStatus.ACTIVE);
        
        Conversation updatedConversation = conversationRepository.save(conversation);
        log.info("Admin assigned successfully to conversation {}", conversationId);
        
        return updatedConversation;
    }

    @Override
    public Conversation updateConversationStatus(Long conversationId, ConversationStatus status) {
        log.info("Updating conversation {} status to {}", conversationId, status);
        
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + conversationId));
        
        conversation.setStatus(status);
        
        Conversation updatedConversation = conversationRepository.save(conversation);
        log.info("Conversation status updated successfully");
        
        return updatedConversation;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Conversation> getConversationById(Long conversationId) {
        log.debug("Fetching conversation with ID: {}", conversationId);
        return conversationRepository.findById(conversationId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Conversation> getConversationsByCandidate(Long candidateId) {
        log.debug("Fetching conversations for candidate ID: {}", candidateId);
        
        // Validate candidate exists
        if (!userRepository.existsById(candidateId)) {
            throw new ResourceNotFoundException("Candidate not found with ID: " + candidateId);
        }
        
        return conversationRepository.findByCandidateId(candidateId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Conversation> getConversationsByAdmin(Long adminId) {
        log.debug("Fetching conversations for admin ID: {}", adminId);
        
        // Validate admin exists
        if (!userRepository.existsById(adminId)) {
            throw new ResourceNotFoundException("Admin not found with ID: " + adminId);
        }
        
        return conversationRepository.findByAdminId(adminId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Conversation> getConversationsByStatus(ConversationStatus status) {
        log.debug("Fetching conversations with status: {}", status);
        return conversationRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Conversation> getActiveConversationsByAdmin(Long adminId) {
        log.debug("Fetching active conversations for admin ID: {}", adminId);
        
        // Validate admin exists
        if (!userRepository.existsById(adminId)) {
            throw new ResourceNotFoundException("Admin not found with ID: " + adminId);
        }
        
        return conversationRepository.findByAdminIdAndStatus(adminId, ConversationStatus.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Conversation> getUnassignedConversations() {
        log.debug("Fetching unassigned conversations");
        return conversationRepository.findByAdminIdAndStatus(null, ConversationStatus.ACTIVE);
    }

    @Override
    public Conversation closeConversation(Long conversationId) {
        log.info("Closing conversation {}", conversationId);
        return updateConversationStatus(conversationId, ConversationStatus.CLOSED);
    }

    @Override
    public Conversation reopenConversation(Long conversationId) {
        log.info("Reopening conversation {}", conversationId);
        return updateConversationStatus(conversationId, ConversationStatus.ACTIVE);
    }
} 
package com.ats.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ats.model.Chat;
import com.ats.model.Conversation;
import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByConversationId(Long conversationId);
    List<Chat> findBySenderId(Long senderId);
    List<Chat> findByConversationIdAndSenderId(Long conversationId, Long senderId);
    List<Chat> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    List<Chat> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    
    // Pageable method for recent messages
    Page<Chat> findByConversationId(Long conversationId, Pageable pageable);
}

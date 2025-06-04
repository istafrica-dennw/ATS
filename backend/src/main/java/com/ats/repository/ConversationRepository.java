package com.ats.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ats.model.Conversation;
import com.ats.model.ConversationStatus;
import java.util.List;


public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByCandidateId(Long candidateId);
    List<Conversation> findByAdminId(Long adminId);
    List<Conversation> findByStatus(ConversationStatus status);
    List<Conversation> findByCandidateIdAndStatus(Long candidateId, ConversationStatus status);
    List<Conversation> findByAdminIdAndStatus(Long adminId, ConversationStatus status);
    List<Conversation> findByCandidateIdAndAdminId(Long candidateId, Long adminId);
    List<Conversation> findByCandidateIdAndAdminIdAndStatus(Long candidateId, Long adminId, ConversationStatus status);

}

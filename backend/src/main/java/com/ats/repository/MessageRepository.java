package com.ats.repository;

import com.ats.model.Message;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends BaseRepository<Message> {
    // Custom queries can be added here
    // For example: Message findByContent(String content);
} 
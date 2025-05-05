package com.ats.service.impl;

import com.ats.model.Message;
import com.ats.repository.MessageRepository;
import com.ats.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    @Autowired
    public MessageServiceImpl(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Override
    public Message saveMessage(String content) {
        Message message = new Message();
        message.setContent(content);
        return messageRepository.save(message);
    }

    @Override
    public Message getLatestMessage() {
        List<Message> messages = messageRepository.findAll();
        return messages.isEmpty() ? null : messages.get(messages.size() - 1);
    }
} 
package com.ats.service;

import com.ats.model.Message;

public interface MessageService {
    Message saveMessage(String content);
    Message getLatestMessage();
} 
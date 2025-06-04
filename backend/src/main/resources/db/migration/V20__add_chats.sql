CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT UNIQUE NOT NULL,
    admin_id BIGINT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'HOLD', 'CLOSED')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidate FOREIGN KEY (candidate_id) REFERENCES users(id),
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE INDEX idx_conversations_candidate_id ON conversations(candidate_id);
CREATE INDEX idx_conversations_admin_id ON conversations(admin_id);

-- Messages Table
CREATE TABLE chats (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id)
);
CREATE INDEX idx_chats_conversation_id ON chats(conversation_id);
CREATE INDEX idx_chats_sender_id ON chats(sender_id);
package com.ats.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "testmessages")
@Getter
@Setter
public class Message extends BaseEntity {
    
    @Column(nullable = false)
    private String content;
} 
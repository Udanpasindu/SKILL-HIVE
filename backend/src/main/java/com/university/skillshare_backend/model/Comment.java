package com.university.skillshare_backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;
    private String postId;
    private String userId;
    private String text;
    private LocalDateTime createdAt;
    
    // Default constructor
    public Comment() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Constructor with postId, userId, and text
    public Comment(String postId, String userId, String text) {
        this.postId = postId;
        this.userId = userId;
        this.text = text;
        this.createdAt = LocalDateTime.now();
    }
}

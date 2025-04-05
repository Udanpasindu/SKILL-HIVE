package com.university.skillshare_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "likes")
public class Like {
    @Id
    private String id;
    private String postId;
    private String userId;
    
    // Default constructor
    public Like() {}
    
    // Constructor with postId and userId
    public Like(String postId, String userId) {
        this.postId = postId;
        this.userId = userId;
    }
}

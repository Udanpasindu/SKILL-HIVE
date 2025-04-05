package com.university.skillshare_backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
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
    
    // Animation flags (not persisted to database)
    @Transient
    private boolean isNew;
    
    @Transient
    private boolean isUpdated;
    
    // Author name (not persisted to database)
    @Transient
    private String authorName;
    
    // Default constructor
    public Comment() {
        this.createdAt = LocalDateTime.now();
        this.isNew = false;
        this.isUpdated = false;
    }
    
    // Constructor with postId, userId, and text
    public Comment(String postId, String userId, String text) {
        this.postId = postId;
        this.userId = userId;
        this.text = text;
        this.createdAt = LocalDateTime.now();
        this.isNew = false;
        this.isUpdated = false;
    }
    
    public void setIsNew(boolean isNew) {
        this.isNew = isNew;
    }
    
    public boolean getIsNew() {
        return this.isNew;
    }
    
    public void setIsUpdated(boolean isUpdated) {
        this.isUpdated = isUpdated;
    }
    
    public boolean getIsUpdated() {
        return this.isUpdated;
    }
    
    public String getAuthorName() {
        return authorName;
    }
    
    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }
}

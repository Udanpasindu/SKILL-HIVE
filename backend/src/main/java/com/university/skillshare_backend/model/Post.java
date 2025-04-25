package com.university.skillshare_backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String userId;
    private String title;
    private String content;
    private List<String> imageUrls = new ArrayList<>();
    private String videoUrl;
    private LocalDateTime createdAt;
    
    // Default constructor
    public Post() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Constructor with userId, title and content
    public Post(String userId, String title, String content) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }
}
package com.university.skillshare_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "shared_posts")
public class SharedPost {
    @Id
    private String id;
    
    private String postId;
    private String groupId;
    private String sharedBy;
    private Date sharedAt;
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getPostId() {
        return postId;
    }
    
    public void setPostId(String postId) {
        this.postId = postId;
    }
    
    public String getGroupId() {
        return groupId;
    }
    
    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }
    
    public String getSharedBy() {
        return sharedBy;
    }
    
    public void setSharedBy(String sharedBy) {
        this.sharedBy = sharedBy;
    }
    
    public Date getSharedAt() {
        return sharedAt;
    }
    
    public void setSharedAt(Date sharedAt) {
        this.sharedAt = sharedAt;
    }
}

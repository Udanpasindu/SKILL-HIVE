package com.university.skillshare_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String name;
    private String description;
    private String photoUrl;
    private String ownerId;
    private List<String> members = new ArrayList<>();
    private Date createdAt;

    // Default constructor
    public Group() {
        this.members = new ArrayList<>();
    }
    
    // Method to set creation date
    public void setCreatedAt(LocalDateTime dateTime) {
        this.createdAt = Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
    
    // Check if user is a member
    public boolean hasMember(User user) {
        return this.members.contains(user.getId());
    }
    
    // Add a user as member
    public void addMember(User user) {
        if (!this.members.contains(user.getId())) {
            this.members.add(user.getId());
        }
    }
    
    // Remove a user from members
    public void removeMember(User user) {
        this.members.remove(user.getId());
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public List<String> getMembers() {
        return members;
    }

    public void setMembers(List<String> members) {
        this.members = members;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}

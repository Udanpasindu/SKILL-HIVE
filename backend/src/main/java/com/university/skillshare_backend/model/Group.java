package com.university.skillshare_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String name;
    private String description;
    private String photoUrl;
    private String ownerId;
    private LocalDateTime createdAt;
    
    @DBRef
    private Set<User> members = new HashSet<>();

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Set<User> getMembers() {
        return members != null ? members : new HashSet<>();
    }
    
    public void setMembers(Set<User> members) {
        this.members = members != null ? members : new HashSet<>();
    }
    
    public boolean hasMember(User user) {
        return getMembers().stream()
            .anyMatch(member -> member.getId().equals(user.getId()));
    }
    
    public void addMember(User user) {
        if (this.members == null) {
            this.members = new HashSet<>();
        }
        if (!hasMember(user)) {
            this.members.add(user);
        }
    }
    
    public void removeMember(User user) {
        if (this.members != null) {
            this.members.removeIf(member -> member.getId().equals(user.getId()));
        }
    }
}

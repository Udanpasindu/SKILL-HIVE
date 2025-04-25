package com.university.skillshare_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.UserRepository;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final WebSocketService webSocketService;

    @Autowired
    public UserService(UserRepository userRepository, 
                      NotificationService notificationService,
                      WebSocketService webSocketService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.webSocketService = webSocketService;
    }

    /**
     * Follow a user
     * 
     * @param followerId The ID of the user who is following
     * @param userId The ID of the user to follow
     * @return True if successfully followed, false otherwise
     */
    public boolean followUser(String followerId, String userId) {
        // Check that users exist
        User follower = userRepository.findById(followerId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", followerId));
        
        User userToFollow = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Initialize following set if null
        if (follower.getFollowing() == null) {
            follower.setFollowing(new HashSet<>());
        }
        
        // Initialize followers set if null
        if (userToFollow.getFollowers() == null) {
            userToFollow.setFollowers(new HashSet<>());
        }
        
        // Add to following/followers
        follower.getFollowing().add(userId);
        userToFollow.getFollowers().add(followerId);
        
        // Save both users
        userRepository.save(follower);
        userRepository.save(userToFollow);
        
        // Create notification for the user being followed
        notificationService.createFollowNotification(
            userId, follower.getFullName() != null ? follower.getFullName() : follower.getUsername(), followerId);
        
        // Broadcast follow event via WebSocket
        webSocketService.broadcastFollowEvent(userId, followerId);
        
        return true;
    }
    
    /**
     * Unfollow a user
     * 
     * @param followerId The ID of the user who is unfollowing
     * @param userId The ID of the user to unfollow
     * @return True if successfully unfollowed, false otherwise
     */
    public boolean unfollowUser(String followerId, String userId) {
        // Check that users exist
        User follower = userRepository.findById(followerId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", followerId));
        
        User userToUnfollow = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Remove from following/followers if sets are not null
        if (follower.getFollowing() != null) {
            follower.getFollowing().remove(userId);
        }
        
        if (userToUnfollow.getFollowers() != null) {
            userToUnfollow.getFollowers().remove(followerId);
        }
        
        // Save both users
        userRepository.save(follower);
        userRepository.save(userToUnfollow);
        
        // Broadcast unfollow event via WebSocket
        webSocketService.broadcastUnfollowEvent(userId, followerId);
        
        return true;
    }
    
    /**
     * Check if a user is following another user
     * 
     * @param followerId The ID of the potential follower
     * @param userId The ID of the user to check
     * @return True if following, false otherwise
     */
    public boolean isFollowing(String followerId, String userId) {
        User follower = userRepository.findById(followerId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", followerId));
        
        return follower.getFollowing() != null && follower.getFollowing().contains(userId);
    }

    /**
     * Get the number of followers for a user
     * 
     * @param userId The ID of the user
     * @return The follower count
     */
    public int getFollowerCount(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
        return user.getFollowers() != null ? user.getFollowers().size() : 0;
    }
    
    /**
     * Get the number of users being followed by a user
     * 
     * @param userId The ID of the user
     * @return The following count
     */
    public int getFollowingCount(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
        return user.getFollowing() != null ? user.getFollowing().size() : 0;
    }

    /**
     * Get the list of users who follow this user
     * 
     * @param userId The ID of the user
     * @return List of follower users
     */
    public List<User> getFollowers(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
        List<User> followers = new ArrayList<>();
        if (user.getFollowers() != null && !user.getFollowers().isEmpty()) {
            // Fetch each follower user by ID
            for (String followerId : user.getFollowers()) {
                userRepository.findById(followerId).ifPresent(followers::add);
            }
        }
        
        return followers;
    }
    
    /**
     * Get the list of users this user follows
     * 
     * @param userId The ID of the user
     * @return List of following users
     */
    public List<User> getFollowing(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
        List<User> following = new ArrayList<>();
        if (user.getFollowing() != null && !user.getFollowing().isEmpty()) {
            // Fetch each followed user by ID
            for (String followedId : user.getFollowing()) {
                userRepository.findById(followedId).ifPresent(following::add);
            }
        }
        
        return following;
    }
}

package com.university.skillshare_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.model.Like;
import com.university.skillshare_backend.repository.LikeRepository;
import com.university.skillshare_backend.repository.PostRepository;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final WebSocketService webSocketService;
    
    @Autowired
    public LikeService(
            LikeRepository likeRepository, 
            PostRepository postRepository,
            WebSocketService webSocketService) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.webSocketService = webSocketService;
    }
    
    /**
     * Add a like to a post
     * 
     * @param postId The post ID
     * @param userId The user ID
     * @return The updated like count
     */
    public long likePost(String postId, String userId) {
        // Verify post exists
        postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        // Check if user already liked the post
        Like existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike == null) {
            Like like = new Like(postId, userId);
            likeRepository.save(like);
        }
        
        // Get updated like count
        long likeCount = likeRepository.countByPostId(postId);
        
        // Broadcast the update via WebSocket
        webSocketService.broadcastLikeCount(postId, likeCount);
        
        return likeCount;
    }
    
    /**
     * Remove a like from a post
     * 
     * @param postId The post ID
     * @param userId The user ID
     * @return The updated like count
     */
    public long unlikePost(String postId, String userId) {
        // Verify post exists
        postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        // Delete the like if it exists
        likeRepository.deleteByPostIdAndUserId(postId, userId);
        
        // Get updated like count
        long likeCount = likeRepository.countByPostId(postId);
        
        // Broadcast the update via WebSocket
        webSocketService.broadcastLikeCount(postId, likeCount);
        
        return likeCount;
    }
    
    /**
     * Get the like count for a post
     * 
     * @param postId The post ID
     * @return The like count
     */
    public long getLikeCount(String postId) {
        // Verify post exists
        postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        return likeRepository.countByPostId(postId);
    }
    
    /**
     * Check if a user has liked a post
     * 
     * @param postId The post ID
     * @param userId The user ID
     * @return True if the user liked the post, false otherwise
     */
    public boolean hasUserLiked(String postId, String userId) {
        return likeRepository.findByPostIdAndUserId(postId, userId) != null;
    }
}

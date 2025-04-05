package com.university.skillshare_backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController; 

import com.university.skillshare_backend.service.LikeService;

@RestController
@RequestMapping("/api")
public class LikeController {

    private final LikeService likeService;
    
    @Autowired
    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }
    
    /**
     * Add a like to a post
     * 
     * @param postId The post ID
     * @param userId The user ID (from auth token in a real app)
     * @return Response with updated like count
     */
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<Map<String, Object>> likePost(
            @PathVariable String postId,
            @RequestParam String userId) { // In a real app, get userId from auth token
        
        long likeCount = likeService.likePost(postId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("postId", postId);
        response.put("likeCount", likeCount);
        response.put("liked", true);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Remove a like from a post
     * 
     * @param postId The post ID
     * @param userId The user ID (from auth token in a real app)
     * @return Response with updated like count
     */
    @DeleteMapping("/posts/{postId}/like")
    public ResponseEntity<Map<String, Object>> unlikePost(
            @PathVariable String postId,
            @RequestParam String userId) { // In a real app, get userId from auth token
        
        long likeCount = likeService.unlikePost(postId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("postId", postId);
        response.put("likeCount", likeCount);
        response.put("liked", false);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get the current like count for a post
     * 
     * @param postId The post ID
     * @return Response with like count
     */
    @GetMapping("/posts/{postId}/likes")
    public ResponseEntity<Map<String, Object>> getLikeCount(
            @PathVariable String postId,
            @RequestParam(required = false) String userId) {
        
        long likeCount = likeService.getLikeCount(postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("postId", postId);
        response.put("likeCount", likeCount);
        
        // If userId is provided, check if user has liked the post
        if (userId != null && !userId.isEmpty()) {
            boolean hasLiked = likeService.hasUserLiked(postId, userId);
            response.put("hasLiked", hasLiked);
        }
        
        return ResponseEntity.ok(response);
    }
}

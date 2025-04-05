package com.university.skillshare_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    /**
     * Broadcast like count update to all clients subscribed to the post
     * 
     * @param postId The post ID
     * @param likeCount The updated like count
     */
    public void broadcastLikeCount(String postId, long likeCount) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("postId", postId);
        payload.put("likeCount", likeCount);
        
        messagingTemplate.convertAndSend("/topic/likes/" + postId, payload);
    }
    
    /**
     * Broadcast new comment to all clients subscribed to the post
     * 
     * @param postId The post ID
     * @param comment The new comment
     */
    public void broadcastNewComment(String postId, Object comment) {
        messagingTemplate.convertAndSend("/topic/comments/" + postId, comment);
    }
    
    /**
     * Broadcast comment update to all clients subscribed to the post
     * 
     * @param postId The post ID
     * @param comment The updated comment
     */
    public void broadcastCommentUpdate(String postId, Object comment) {
        messagingTemplate.convertAndSend("/topic/comments/" + postId + "/updates", comment);
    }
}

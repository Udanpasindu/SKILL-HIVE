package com.university.skillshare_backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.university.skillshare_backend.model.Comment;
import com.university.skillshare_backend.service.CommentService;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;
    
    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }
    
    /**
     * Add a comment to a post
     * 
     * @param postId The post ID
     * @param userId The user ID (from auth token in a real app)
     * @param commentRequest Request body containing text
     * @return The created comment
     */
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable String postId,
            @RequestParam String userId, // In a real app, get from auth token
            @RequestBody Map<String, String> commentRequest) {
        
        String commentText = commentRequest.get("text");
        Comment newComment = commentService.addComment(postId, userId, commentText);
        
        return new ResponseEntity<>(newComment, HttpStatus.CREATED);
    }
    
    /**
     * Edit a comment
     * 
     * @param commentId The comment ID
     * @param userId The user ID (from auth token in a real app)
     * @param commentRequest Request body containing updated text
     * @return The updated comment
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> editComment(
            @PathVariable String commentId,
            @RequestParam String userId, // In a real app, get from auth token
            @RequestBody Map<String, String> commentRequest) {
        
        String updatedText = commentRequest.get("text");
        Comment updatedComment = commentService.editComment(commentId, userId, updatedText);
        
        return ResponseEntity.ok(updatedComment);
    }
    
    /**
     * Delete a comment
     * 
     * @param commentId The comment ID
     * @param userId The user ID (from auth token in a real app)
     * @return Success message
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(
            @PathVariable String commentId,
            @RequestParam String userId) { // In a real app, get from auth token
        
        commentService.deleteComment(commentId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Comment deleted successfully");
        response.put("commentId", commentId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all comments for a post
     * 
     * @param postId The post ID
     * @return List of comments
     */
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable String postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }
}

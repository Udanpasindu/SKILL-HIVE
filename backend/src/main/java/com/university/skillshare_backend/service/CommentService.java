package com.university.skillshare_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.model.Comment;
import com.university.skillshare_backend.model.Post;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.CommentRepository;
import com.university.skillshare_backend.repository.PostRepository;
import com.university.skillshare_backend.repository.UserRepository;
import com.university.skillshare_backend.util.MentionParser;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MentionParser mentionParser;
    private final WebSocketService webSocketService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    public CommentService(
            CommentRepository commentRepository,
            PostRepository postRepository,
            UserRepository userRepository,
            MentionParser mentionParser,
            WebSocketService webSocketService) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.mentionParser = mentionParser;
        this.webSocketService = webSocketService;
    }
    
    /**
     * Add a comment to a post
     */
    public Comment addComment(String postId, String userId, String text, boolean isDirectApiCall) {
        // Verify post exists
        postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        // Verify user exists and get user data
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Parse mentions
        List<String> mentions = mentionParser.parseMentions(text);
        
        // Create and save the comment
        Comment comment = new Comment(postId, userId, text);
        // Set animation flags
        comment.setIsNew(true);
        // Set author name from user
        comment.setAuthorName(user.getFullName() != null && !user.getFullName().isEmpty() 
            ? user.getFullName() : user.getUsername());
            
        Comment savedComment = commentRepository.save(comment);
        
        // Handle mentions and notifications
        processMentions(mentions, savedComment);
        
        // Only broadcast via WebSocket if this isn't a direct API call
        if (!isDirectApiCall) {
            webSocketService.broadcastNewComment(postId, savedComment);
        }
        
        return savedComment;
    }

    // Add overloaded method for backward compatibility
    public Comment addComment(String postId, String userId, String text) {
        return addComment(postId, userId, text, false);
    }
    
    /**
     * Edit a comment
     */
    public Comment editComment(String commentId, String userId, String text) {
        // Fetch and verify comment exists
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        
        // Verify user owns the comment
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You don't have permission to edit this comment");
        }
        
        // Parse mentions from the updated text
        List<String> mentions = mentionParser.parseMentions(text);
        
        // Update the comment
        comment.setText(text);
        Comment updatedComment = commentRepository.save(comment);
        
        // Set the author name for the updated comment
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        updatedComment.setAuthorName(user.getFullName() != null && !user.getFullName().isEmpty() 
            ? user.getFullName() : user.getUsername());
        
        // Handle mentions (could send notifications here)
        processMentions(mentions, updatedComment);
        
        // Broadcast the update via WebSocket
        webSocketService.broadcastCommentUpdate(comment.getPostId(), updatedComment);
        
        return updatedComment;
    }
    
    /**
     * Delete a comment
     */
    public void deleteComment(String commentId, String userId) {
        // Fetch and verify comment exists
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        
        // Fetch the associated post to check ownership
        Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", comment.getPostId()));
        
        // Verify user is either the comment owner or the post owner
        if (!comment.getUserId().equals(userId) && !post.getUserId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this comment");
        }
        
        // Delete the comment
        commentRepository.delete(comment);
        
        // Broadcast the deletion via WebSocket
        webSocketService.broadcastCommentUpdate(comment.getPostId(), 
                java.util.Collections.singletonMap("deleted", commentId));
    }
    
    /**
     * Get all comments for a post
     */
    public List<Comment> getCommentsByPostId(String postId) {
        // Verify post exists
        postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        // Get all comments for the post
        List<Comment> comments = commentRepository.findByPostId(postId);
        
        // Populate author names for each comment
        return comments.stream().map(comment -> {
            userRepository.findById(comment.getUserId()).ifPresent(user -> {
                comment.setAuthorName(user.getFullName() != null && !user.getFullName().isEmpty() 
                    ? user.getFullName() : user.getUsername());
            });
            return comment;
        }).collect(Collectors.toList());
    }
    
    /**
     * Process mentions in a comment
     */
    private void processMentions(List<String> mentions, Comment comment) {
        if (mentions == null || mentions.isEmpty()) {
            return;
        }

        try {
            Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", comment.getPostId()));
                
            User commenter = userRepository.findById(comment.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", comment.getUserId()));

            for (String username : mentions) {
                userRepository.findByUsername(username).ifPresent(mentionedUser -> {
                    // Don't notify if the user mentions themselves
                    if (!mentionedUser.getId().equals(comment.getUserId())) {
                        notificationService.createMentionNotification(
                            mentionedUser.getId(),
                            commenter.getUsername(),
                            post.getId()
                        );
                    }
                });
            }
        } catch (Exception e) {
            // Log the error but don't fail the comment creation
            System.err.println("Error processing mentions: " + e.getMessage());
        }
    }
}

package com.university.skillshare_backend.controller;

import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.model.Post;
import com.university.skillshare_backend.model.Reaction;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.PostRepository;
import com.university.skillshare_backend.repository.ReactionRepository;
import com.university.skillshare_backend.repository.UserRepository;
import com.university.skillshare_backend.service.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReactionController {
    
    private final ReactionRepository reactionRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    @Autowired
    public ReactionController(
            ReactionRepository reactionRepository, 
            PostRepository postRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.reactionRepository = reactionRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }
    
    /**
     * Add or update a reaction to a post
     */
    @PostMapping("/posts/{postId}/reactions")
    public ResponseEntity<?> addReaction(
            @PathVariable String postId,
            @RequestParam String userId,
            @RequestParam String type) {
        
        // Validate the post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        // Validate the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Check if this user already has any reaction on this post
        List<Reaction> existingReactions = reactionRepository.findByUserIdAndPostId(userId, postId);
        
        // Remove any existing reactions (one user can have only one reaction type per post)
        if (!existingReactions.isEmpty()) {
            for (Reaction reaction : existingReactions) {
                reactionRepository.delete(reaction);
            }
        }
        
        // Add the new reaction
        Reaction reaction = new Reaction(userId, postId, type);
        Reaction savedReaction = reactionRepository.save(reaction);
        
        // Send notification to post owner if it's not the same user
        if (!post.getUserId().equals(userId)) {
            User reactingUser = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
            String reactorName = reactingUser.getFullName() != null ? 
                    reactingUser.getFullName() : reactingUser.getUsername();
            
            notificationService.createReactionNotification(
                    post.getUserId(), 
                    reactorName, 
                    postId, 
                    type);
        }
        
        // Return counts of all reaction types for this post
        Map<String, Object> response = getReactionCounts(postId);
        response.put("userReaction", savedReaction);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Remove a reaction from a post
     */
    @DeleteMapping("/posts/{postId}/reactions")
    public ResponseEntity<?> removeReaction(
            @PathVariable String postId,
            @RequestParam String userId,
            @RequestParam String type) {
        
        // Find and delete the reaction
        Optional<Reaction> reaction = reactionRepository.findByPostIdAndUserIdAndType(postId, userId, type);
        
        if (reaction.isPresent()) {
            reactionRepository.delete(reaction.get());
        }
        
        // Return updated reaction counts
        return ResponseEntity.ok(getReactionCounts(postId));
    }
    
    /**
     * Get all reactions for a post
     */
    @GetMapping("/posts/{postId}/reactions")
    public ResponseEntity<Map<String, Object>> getReactions(
            @PathVariable String postId,
            @RequestParam(required = false) String userId) {
        
        Map<String, Object> response = getReactionCounts(postId);
        
        // If userId is provided, also return this user's reaction
        if (userId != null && !userId.isEmpty()) {
            List<Reaction> userReactions = reactionRepository.findByUserIdAndPostId(userId, postId);
            if (!userReactions.isEmpty()) {
                response.put("userReaction", userReactions.get(0));
            }
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get counts of all reaction types for a post
     */
    private Map<String, Object> getReactionCounts(String postId) {
        List<Reaction> reactions = reactionRepository.findByPostId(postId);
        
        Map<String, Long> counts = reactions.stream()
                .collect(Collectors.groupingBy(Reaction::getType, Collectors.counting()));
        
        Map<String, Object> response = new HashMap<>();
        response.put("total", reactions.size());
        response.put("counts", counts);
        
        return response;
    }
}

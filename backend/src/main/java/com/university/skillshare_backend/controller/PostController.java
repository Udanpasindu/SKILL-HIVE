package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.model.Post;
import com.university.skillshare_backend.repository.PostRepository;
import com.university.skillshare_backend.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public PostController(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Create a new post
     * 
     * @param post Post object from request body
     * @return The created post
     */
    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        // Verify user exists
        userRepository.findById(post.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", post.getUserId()));
            
        Post savedPost = postRepository.save(post);
        return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
    }
    
    /**
     * Get all posts
     * 
     * @return List of posts
     */
    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return ResponseEntity.ok(posts);
    }
    
    /**
     * Get post by ID
     * 
     * @param postId Post ID
     * @return Post details
     */
    @GetMapping("/posts/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        return ResponseEntity.ok(post);
    }
    
    /**
     * Get posts by user ID
     * 
     * @param userId User ID
     * @return List of posts by the user
     */
    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable String userId) {
        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
        List<Post> posts = postRepository.findByUserId(userId);
        return ResponseEntity.ok(posts);
    }
}

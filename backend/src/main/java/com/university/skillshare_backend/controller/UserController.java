package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.university.skillshare_backend.dto.UserUpdateRequest;
import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.UserRepository;
import com.university.skillshare_backend.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Consider restricting this in production
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @Autowired
    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    /**
     * Create a new user
     * 
     * @param user User object from request body
     * @return The created user
     */
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userRepository.save(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    /**
     * Search for users by username fragment (for @mentions)
     * 
     * @param query Username fragment to search
     * @return List of matching users
     */
    @GetMapping("/users/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        List<User> users = userRepository.findByUsernameContaining(query);
        return ResponseEntity.ok(users);
    }

    /**
     * Get all users
     * 
     * @return List of all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     * 
     * @param userId User ID
     * @return User details
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return ResponseEntity.ok(user);
    }

    /**
     * Get user by username
     * 
     * @param username Username
     * @return User details
     */
    @GetMapping("/users/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return ResponseEntity.ok(user);
    }

    /**
     * Update user profile
     * 
     * @param userId User ID
     * @param userUpdateRequest Fields to update
     * @return Updated user details
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest userUpdateRequest) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if username is changed and not already taken
        if (userUpdateRequest.getUsername() != null &&
            !userUpdateRequest.getUsername().equals(existingUser.getUsername())) {
            if (userRepository.findByUsername(userUpdateRequest.getUsername()).isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Username is already taken");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            existingUser.setUsername(userUpdateRequest.getUsername());
        }

        // Check if email is changed and not already taken
        if (userUpdateRequest.getEmail() != null &&
            !userUpdateRequest.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.findByEmail(userUpdateRequest.getEmail()).isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Email is already registered");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            existingUser.setEmail(userUpdateRequest.getEmail());
        }

        // Update other fields
        if (userUpdateRequest.getFullName() != null) {
            existingUser.setFullName(userUpdateRequest.getFullName());
        }

        User updatedUser = userRepository.save(existingUser);
        updatedUser.setPassword(null); // Don't return password

        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Follow a user
     * 
     * @param followerId The ID of the user who is following
     * @param userId The ID of the user to follow
     * @return Response indicating success or failure
     */
    @PostMapping("/users/{followerId}/follow/{userId}")
    public ResponseEntity<Map<String, Object>> followUser(
            @PathVariable String followerId,
            @PathVariable String userId) {

        boolean result = userService.followUser(followerId, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result);
        response.put("followerId", followerId);
        response.put("userId", userId);
        response.put("following", true);

        return ResponseEntity.ok(response);
    }

    /**
     * Unfollow a user
     * 
     * @param followerId The ID of the user who is unfollowing
     * @param userId The ID of the user to unfollow
     * @return Response indicating success or failure
     */
    @DeleteMapping("/users/{followerId}/unfollow/{userId}")
    public ResponseEntity<Map<String, Object>> unfollowUser(
            @PathVariable String followerId,
            @PathVariable String userId) {

        boolean result = userService.unfollowUser(followerId, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result);
        response.put("followerId", followerId);
        response.put("userId", userId);
        response.put("following", false);

        return ResponseEntity.ok(response);
    }

    /**
     * Check if a user is following another user
     * 
     * @param followerId The ID of the potential follower
     * @param userId The ID of the user to check
     * @return Boolean indicating follow status
     */
    @GetMapping("/users/{followerId}/following/{userId}")
    public ResponseEntity<Boolean> isFollowing(
            @PathVariable String followerId,
            @PathVariable String userId) {

        boolean isFollowing = userService.isFollowing(followerId, userId);
        return ResponseEntity.ok(isFollowing);
    }

    /**
     * Get the count of followers for a user
     * 
     * @param userId The ID of the user
     * @return Number of followers
     */
    @GetMapping("/users/{userId}/followers/count")
    public ResponseEntity<Integer> getFollowerCount(@PathVariable String userId) {
        int count = userService.getFollowerCount(userId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get the count of users being followed by a user
     * 
     * @param userId The ID of the user
     * @return Number of users being followed
     */
    @GetMapping("/users/{userId}/following/count")
    public ResponseEntity<Integer> getFollowingCount(@PathVariable String userId) {
        int count = userService.getFollowingCount(userId);
        return ResponseEntity.ok(count);
    }

    /**
     * Get a list of users who follow a user
     * 
     * @param userId The ID of the user
     * @return List of followers
     */
    @GetMapping("/users/{userId}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable String userId) {
        List<User> followers = userService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }
    
    /**
     * Get a list of users followed by a user
     * 
     * @param userId The ID of the user
     * @return List of users being followed
     */
    @GetMapping("/users/{userId}/following")
    public ResponseEntity<List<User>> getFollowing(@PathVariable String userId) {
        List<User> following = userService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }
}

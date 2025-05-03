package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.university.skillshare_backend.dto.UserUpdateRequest;
import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.model.Group;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.GroupRepository;
import com.university.skillshare_backend.repository.UserRepository;
import com.university.skillshare_backend.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final GroupRepository groupRepository;

    @Autowired
    public UserController(UserRepository userRepository, UserService userService, GroupRepository groupRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.groupRepository = groupRepository;
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userRepository.save(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        List<User> users = userRepository.findByUsernameContaining(query);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest userUpdateRequest) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (userUpdateRequest.getUsername() != null &&
                !userUpdateRequest.getUsername().equals(existingUser.getUsername())) {
            if (userRepository.findByUsername(userUpdateRequest.getUsername()).isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Username is already taken");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            existingUser.setUsername(userUpdateRequest.getUsername());
        }

        if (userUpdateRequest.getEmail() != null &&
                !userUpdateRequest.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.findByEmail(userUpdateRequest.getEmail()).isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Email is already registered");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            existingUser.setEmail(userUpdateRequest.getEmail());
        }

        if (userUpdateRequest.getFullName() != null) {
            existingUser.setFullName(userUpdateRequest.getFullName());
        }

        User updatedUser = userRepository.save(existingUser);
        updatedUser.setPassword(null); // Hide password in response

        return ResponseEntity.ok(updatedUser);
    }

    // Follow a user
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

    // Unfollow a user
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

    // Check if following
    @GetMapping("/users/{followerId}/following/{userId}")
    public ResponseEntity<Boolean> isFollowing(
            @PathVariable String followerId,
            @PathVariable String userId) {

        boolean isFollowing = userService.isFollowing(followerId, userId);
        return ResponseEntity.ok(isFollowing);
    }

    // Follower count
    @GetMapping("/users/{userId}/followers/count")
    public ResponseEntity<Integer> getFollowerCount(@PathVariable String userId) {
        int count = userService.getFollowerCount(userId);
        return ResponseEntity.ok(count);
    }

    // Following count
    @GetMapping("/users/{userId}/following/count")
    public ResponseEntity<Integer> getFollowingCount(@PathVariable String userId) {
        int count = userService.getFollowingCount(userId);
        return ResponseEntity.ok(count);
    }

    // Get all followers
    @GetMapping("/users/{userId}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable String userId) {
        List<User> followers = userService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    // Get all followings
    @GetMapping("/users/{userId}/following")
    public ResponseEntity<List<User>> getFollowing(@PathVariable String userId) {
        List<User> following = userService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }

    // Get all groups a user is a member of
    @GetMapping("/users/{userId}/groups")
    public ResponseEntity<List<Group>> getUserGroups(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Group> groups = groupRepository.findByMembersContains(userId);
        return ResponseEntity.ok(groups);
    }
}

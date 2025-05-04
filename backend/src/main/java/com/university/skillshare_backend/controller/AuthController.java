package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.university.skillshare_backend.dto.LoginRequest;
import com.university.skillshare_backend.dto.RegisterRequest;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder; // Use the injected bean
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Username is already taken");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
        
        // Check if email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Email is already registered");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
        
        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setFullName(registerRequest.getFullName());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        
        User savedUser = userRepository.save(user);
        
        // Hide password in response
        savedUser.setPassword(null);
        
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for user: {}", loginRequest.getUsername());
        
        // List all users for debugging (remove in production)
        List<User> allUsers = userRepository.findAll();
        logger.info("Total users in database: {}", allUsers.size());
        for (User user : allUsers) {
            logger.info("User in DB: {}", user.getUsername());
        }
        
        Optional<User> userOptional;
        
        // Check if login is with email or username
        if (loginRequest.getUsername().contains("@")) {
            // Email lookups are typically case-insensitive
            userOptional = userRepository.findByEmailIgnoreCase(loginRequest.getUsername());
            logger.info("Looking up by email: {}, found: {}", 
                       loginRequest.getUsername(), userOptional.isPresent());
        } else {
            // Make username lookup case-insensitive
            userOptional = userRepository.findByUsernameIgnoreCase(loginRequest.getUsername());
            logger.info("Looking up by username: {}, found: {}", 
                       loginRequest.getUsername(), userOptional.isPresent());
        }
        
        // Check if user exists
        if (userOptional.isEmpty()) {
            logger.warn("Login failed: user not found - {}", loginRequest.getUsername());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid username/email or password");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        
        User user = userOptional.get();
        
        // Check password
        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        logger.info("Password check for user {}: {}", loginRequest.getUsername(), passwordMatches ? "success" : "failed");
        
        if (!passwordMatches) {
            logger.warn("Login failed: invalid password for user - {}", loginRequest.getUsername());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid username/email or password");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        
        logger.info("Login successful for user: {}", loginRequest.getUsername());
        
        // Hide password in response
        user.setPassword(null);
        
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/verify/{userId}")
    public ResponseEntity<?> verifySession(@PathVariable String userId) {
        try {
            Optional<User> user = userRepository.findById(userId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("valid", user.isPresent());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Boolean> response = new HashMap<>();
            response.put("valid", false);
            return ResponseEntity.ok(response);
        }
    }
}

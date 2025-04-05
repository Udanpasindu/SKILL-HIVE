package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.university.skillshare_backend.dto.LoginRequest;
import com.university.skillshare_backend.dto.RegisterRequest;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
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
        Optional<User> userOptional;
        
        // Check if login is with email or username
        if (loginRequest.getUsername().contains("@")) {
            userOptional = userRepository.findByEmail(loginRequest.getUsername());
        } else {
            userOptional = userRepository.findByUsername(loginRequest.getUsername());
        }
        
        // Check if user exists
        if (userOptional.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid username/email or password");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        
        User user = userOptional.get();
        
        // Check password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid username/email or password");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        
        // Hide password in response
        user.setPassword(null);
        
        return new ResponseEntity<>(user, HttpStatus.OK);
    }
}

package com.university.skillshare_backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder; // Use the injected bean
    }

    @Override
    public void run(String... args) {
        logger.info("Initializing test users...");
        
        // Create test user 1
        createTestUserIfNotExists("testuser", "password123", "Test User", "test@example.com");
        
        // Create test user 2
        createTestUserIfNotExists("akila320", "password123", "Akila User", "akila@example.com");
        
        // Create YeharaD user with known password
        createTestUserIfNotExists("yeharad", "password123", "Yehara D", "yehara@example.com");
        
        logger.info("Test users initialization completed!");
    }
    
    private void createTestUserIfNotExists(String username, String password, String fullName, String email) {
        // Check with case-insensitive username to avoid duplicates
        if (userRepository.findByUsernameIgnoreCase(username).isEmpty()) {
            logger.info("Creating test user: {}", username);
            
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPassword(passwordEncoder.encode(password));
            
            userRepository.save(user);
            
            logger.info("Test user created successfully: {}", username);
        } else {
            logger.info("Test user already exists: {}", username);
        }
    }
}

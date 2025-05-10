package com.university.skillshare_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.university.skillshare_backend.model.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    // Find a user by username
    Optional<User> findByUsername(String username);
    
    // Find a user by email
    Optional<User> findByEmail(String email);
    
    // Find users by username containing the given string (for mention suggestions)
    List<User> findByUsernameContaining(String usernameFragment);
    
    // Find a user by username (case-insensitive)
    Optional<User> findByUsernameIgnoreCase(String username);
    
    // Find a user by email (case-insensitive)
    Optional<User> findByEmailIgnoreCase(String email);
}

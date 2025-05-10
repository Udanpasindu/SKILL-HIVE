package com.university.skillshare_backend.repository;

import com.university.skillshare_backend.model.Reaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends MongoRepository<Reaction, String> {
    List<Reaction> findByPostId(String postId);
    List<Reaction> findByPostIdAndType(String postId, String type);
    Optional<Reaction> findByPostIdAndUserIdAndType(String postId, String userId, String type);
    List<Reaction> findByUserIdAndPostId(String userId, String postId);
    void deleteByPostIdAndUserIdAndType(String postId, String userId, String type);
    long countByPostId(String postId);
    long countByPostIdAndType(String postId, String type);
}

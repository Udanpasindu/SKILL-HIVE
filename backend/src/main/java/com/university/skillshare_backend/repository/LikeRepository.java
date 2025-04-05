package com.university.skillshare_backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.university.skillshare_backend.model.Like;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {
    
    // Count likes for a post
    long countByPostId(String postId);
    
    // Find a like by postId and userId
    Like findByPostIdAndUserId(String postId, String userId);
    
    // Delete a like by postId and userId
    void deleteByPostIdAndUserId(String postId, String userId);
}

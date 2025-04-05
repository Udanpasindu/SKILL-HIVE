package com.university.skillshare_backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.university.skillshare_backend.model.Comment;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    
    // Find all comments for a post
    List<Comment> findByPostId(String postId);
    
    // Find comments by userId
    List<Comment> findByUserId(String userId);
}

package com.university.skillshare_backend.repository;

import com.university.skillshare_backend.model.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {
    
    // Find all achievements ordered by creation date (newest first)
    List<Achievement> findAllByOrderByCreatedAtDesc();
    
    // Find achievements by user ID ordered by creation date (newest first)
    List<Achievement> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Find achievements by user ID and category ordered by creation date (newest first)
    List<Achievement> findByUserIdAndCategoryOrderByCreatedAtDesc(String userId, String category);
    
    // Find distinct categories for a specific user
    @Query(value = "{ 'userId': ?0 }", fields = "{ 'category': 1, '_id': 0 }")
    Set<String> findDistinctCategoriesByUserId(String userId);
}

package com.university.skillshare_backend.controller;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.university.skillshare_backend.model.Achievement;
import com.university.skillshare_backend.repository.AchievementRepository;
import com.university.skillshare_backend.repository.UserRepository;
import com.university.skillshare_backend.service.AchievementService;
import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.exception.UnauthorizedException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AchievementController {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AchievementService achievementService;
    
    @Autowired
    private GridFsTemplate gridFsTemplate;

    @PostMapping("/achievements")
    public ResponseEntity<Achievement> createAchievement(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("userId") String userId,
            @RequestParam(value = "template", required = false) Integer template,
            @RequestParam("image") MultipartFile image) {
        
        try {
            userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            Achievement savedAchievement = achievementService.createAchievement(
                title, description, category, userId, template, image);
            
            return new ResponseEntity<>(savedAchievement, HttpStatus.CREATED);
        } catch (IOException e) {
            throw new RuntimeException("Error uploading image", e);
        }
    }

    @GetMapping("/achievements/image/{id}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String id) {
        try {
            GridFSFile file = achievementService.getFile(id)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));
            
            // Get the content type
            String contentType = "image/jpeg"; // Default
            if (file.getMetadata() != null && file.getMetadata().containsKey("contentType")) {
                contentType = file.getMetadata().get("contentType").toString();
            }
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            
            // Get the GridFsResource
            GridFsResource resource = gridFsTemplate.getResource(file);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(resource.getInputStream()));
        } catch (IOException e) {
            throw new RuntimeException("Error retrieving image", e);
        }
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        try {
            List<Achievement> achievements = achievementRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/achievements/{id}")
    public ResponseEntity<Achievement> getAchievementById(@PathVariable String id) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement", "id", id));
        return ResponseEntity.ok(achievement);
    }

    @GetMapping("/achievements/recent")
    public ResponseEntity<List<Achievement>> getRecentAchievements() {
        try {
            List<Achievement> achievements = achievementRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{userId}/achievements")
    public ResponseEntity<List<Achievement>> getUserAchievements(@PathVariable String userId) {
        try {
            List<Achievement> achievements = achievementRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{userId}/achievements/category/{category}")
    public ResponseEntity<List<Achievement>> getUserAchievementsByCategory(
            @PathVariable String userId,
            @PathVariable String category) {
        try {
            List<Achievement> achievements = achievementRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{userId}/achievements/categories")
    public ResponseEntity<Set<String>> getUserAchievementCategories(@PathVariable String userId) {
        try {
            Set<String> categories = achievementRepository.findDistinctCategoriesByUserId(userId);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{userId}/achievements/latest")
    public ResponseEntity<List<Achievement>> getLatestUserAchievements(@PathVariable String userId) {
        try {
            List<Achievement> achievements = achievementRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{userId}/my-achievements")
    public ResponseEntity<List<Achievement>> getUserOwnAchievements(@PathVariable String userId) {
        try {
            List<Achievement> achievements = achievementRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/achievements/{achievementId}")
    public ResponseEntity<?> updateAchievement(
            @PathVariable String achievementId,
            @RequestParam String userId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam(value = "template", required = false) Integer template,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            // Verify user exists
            userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Verify achievement exists
            Achievement existingAchievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found"));
            
            // Check if the user is authorized to edit this achievement
            if (!existingAchievement.getUserId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to edit this achievement");
            }
            
            Achievement updatedAchievement = achievementService.updateAchievement(
                achievementId, userId, title, description, category, template, image);
            
            return ResponseEntity.ok(updatedAchievement);
        } catch (IOException e) {
            throw new RuntimeException("Error updating image: " + e.getMessage(), e);
        }
    }

    @DeleteMapping("/achievements/{achievementId}")
    public ResponseEntity<?> deleteAchievement(
            @PathVariable String achievementId,
            @RequestParam String userId) {
        
        achievementService.deleteAchievement(achievementId, userId);
        return ResponseEntity.ok().build();
    }
}

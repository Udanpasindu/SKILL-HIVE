package com.university.skillshare_backend.service;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.exception.UnauthorizedException;
import com.university.skillshare_backend.model.Achievement;
import com.university.skillshare_backend.repository.AchievementRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.Optional;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private GridFsTemplate gridFsTemplate;

    @Autowired
    private GridFsOperations gridFsOperations;

    public Achievement createAchievement(String title, String description, String category, 
                                        String userId, Integer template, MultipartFile image) throws IOException {
        
        // Store image in GridFS
        String imageId = storeFile(image);
        
        // Create achievement
        Achievement achievement = new Achievement();
        achievement.setTitle(title);
        achievement.setDescription(description);
        achievement.setCategory(category);
        achievement.setUserId(userId);
        achievement.setTemplate(template != null ? template : 1);
        achievement.setImageId(imageId);
        achievement.setCreatedAt(new Date());
        achievement.setUpdatedAt(new Date());
        
        return achievementRepository.save(achievement);
    }

    public Achievement updateAchievement(String achievementId, String userId, String title, 
                                        String description, String category, Integer template, 
                                        MultipartFile image) throws IOException {
        
        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement", "id", achievementId));
        
        if (!achievement.getUserId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to edit this achievement");
        }
        
        // Update text fields
        achievement.setTitle(title);
        achievement.setDescription(description);
        achievement.setCategory(category);
        
        if (template != null) {
            achievement.setTemplate(template);
        }
        
        // Update image if provided
        if (image != null && !image.isEmpty()) {
            // Delete old image if exists
            if (achievement.getImageId() != null) {
                deleteFile(achievement.getImageId());
            }
            
            // Store new image
            String newImageId = storeFile(image);
            achievement.setImageId(newImageId);
        }
        
        achievement.setUpdatedAt(new Date());
        
        return achievementRepository.save(achievement);
    }

    public void deleteAchievement(String achievementId, String userId) {
        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement", "id", achievementId));
        
        if (!achievement.getUserId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to delete this achievement");
        }
        
        // Delete associated image
        if (achievement.getImageId() != null) {
            deleteFile(achievement.getImageId());
        }
        
        achievementRepository.delete(achievement);
    }

    public Optional<GridFSFile> getFile(String id) {
        return Optional.ofNullable(gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id))));
    }

    private String storeFile(MultipartFile file) throws IOException {
        DBObject metadata = new BasicDBObject();
        metadata.put("fileSize", file.getSize());
        metadata.put("contentType", file.getContentType());
        
        ObjectId id = gridFsTemplate.store(
            file.getInputStream(),
            file.getOriginalFilename(),
            file.getContentType(),
            metadata
        );
        
        return id.toString();
    }

    private void deleteFile(String id) {
        gridFsTemplate.delete(new Query(Criteria.where("_id").is(id)));
    }
}

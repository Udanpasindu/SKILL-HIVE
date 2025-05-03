package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.university.skillshare_backend.model.Group;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.GroupRepository;
import com.university.skillshare_backend.repository.UserRepository;
import com.university.skillshare_backend.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*") // Add CORS support
public class GroupController {
    @Value("${app.upload.dir}")
    private String uploadDir;
    
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private Path fileStorageLocation;
    
    @Autowired
    public GroupController(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }
    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize().resolve("group-photos");
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestParam("file") MultipartFile file,
                                       @RequestParam("name") String name,
                                       @RequestParam("description") String description,
                                       @RequestParam("ownerId") String ownerId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            String fileName = StringUtils.cleanPath(System.currentTimeMillis() + "_" + file.getOriginalFilename());
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            Group group = new Group();
            group.setName(name);
            group.setDescription(description);
            group.setPhotoUrl("http://localhost:8081/api/group-photos/" + fileName); // Update to full URL
            group.setOwnerId(ownerId);
            group.setCreatedAt(LocalDateTime.now());
            
            Group savedGroup = groupRepository.save(group);
            return ResponseEntity.ok(savedGroup);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Could not store file. Error: " + ex.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable String id) {
        try {
            Group group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", id));
            
            // Delete the associated photo file if it exists
            if (group.getPhotoUrl() != null) {
                String fileName = group.getPhotoUrl().substring(group.getPhotoUrl().lastIndexOf('/') + 1);
                Path photoPath = this.fileStorageLocation.resolve(fileName);
                Files.deleteIfExists(photoPath);
            }
            
            groupRepository.deleteById(id);
            return ResponseEntity.ok().body("Group deleted successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting group photo: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupRepository.findAll());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroupById(@PathVariable String groupId) {
        try {
            Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
            return ResponseEntity.ok(group);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
        }
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<?> updateGroup(
            @PathVariable String groupId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile photo) {
        try {
            Group group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
            
            if (name != null && !name.trim().isEmpty()) {
                group.setName(name);
            }
            
            if (description != null) {
                group.setDescription(description);
            }
            
            if (photo != null && !photo.isEmpty()) {
                String fileName = StringUtils.cleanPath(System.currentTimeMillis() + "_" + photo.getOriginalFilename());
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.copy(photo.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                group.setPhotoUrl("http://localhost:8081/api/group-photos/" + fileName); // Update to full URL
            }
            
            Group updatedGroup = groupRepository.save(group);
            return ResponseEntity.ok(updatedGroup);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Could not store file. Error: " + e.getMessage());
        }
    }

    @GetMapping("/photos/{fileName:.+}")
    public ResponseEntity<Resource> getGroupPhoto(@PathVariable String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(@PathVariable String groupId, @RequestParam String userId) {
        try {
            Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
            if (group.getMembers().contains(userId)) {
                return ResponseEntity.badRequest().body("User is already a member of this group");
            }
            
            List<String> members = group.getMembers();
            members.add(userId);
            group.setMembers(members);
            
            Group updatedGroup = groupRepository.save(group);
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(@PathVariable String groupId, @RequestParam String userId) {
        try {
            Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
            if (!group.getMembers().contains(userId)) {
                return ResponseEntity.badRequest().body("User is not a member of this group");
            }
            
            List<String> members = group.getMembers();
            members.remove(userId);
            group.setMembers(members);
            
            Group updatedGroup = groupRepository.save(group);
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{groupId}/remove-member")
    public ResponseEntity<?> removeMember(@PathVariable String groupId, 
                                        @RequestParam String memberId,
                                        @RequestParam String ownerId) {
        try {
            Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
                
            // Verify that the request is made by the owner
            if (!group.getOwnerId().equals(ownerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only group owner can remove members");
            }
            
            User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));
            
            List<String> members = group.getMembers();
            members.remove(memberId);
            group.setMembers(members);
            
            Group updatedGroup = groupRepository.save(group);
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

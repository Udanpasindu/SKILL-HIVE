package com.university.skillshare_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.nio.file.NoSuchFileException;
import org.springframework.beans.factory.annotation.Value;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.model.Post;
import com.university.skillshare_backend.repository.PostRepository;
import com.university.skillshare_backend.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class PostController {
    private static final Logger logger = LoggerFactory.getLogger(PostController.class);
    
    @Value("${file.upload-dir:./uploads}")
    private String baseUploadDir;
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public PostController(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Create a new post with multiple images and video
     * 
     * @param userId User ID
     * @param title Post title
     * @param content Post content
     * @param images Multiple image files (up to 3)
     * @param video Video file (optional)
     * @return The created post
     */
    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(
            @RequestParam("userId") String userId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "video", required = false) MultipartFile video) {
        
        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Create new post
        Post post = new Post(userId, title, content);
        
        try {
            // Process images (up to 3)
            if (images != null && images.length > 0) {
                int imageCount = Math.min(images.length, 3); // Limit to 3 images
                for (int i = 0; i < imageCount; i++) {
                    MultipartFile image = images[i];
                    if (!image.isEmpty() && isValidImageType(image)) {
                        // Process and store image
                        String imageUrl = saveFile(image, "images");
                        post.getImageUrls().add(imageUrl);
                    }
                }
            }
            
            // Process video
            if (video != null && !video.isEmpty()) {
                if (isValidVideoType(video) && isValidVideoDuration(video)) {
                    String videoUrl = saveFile(video, "videos");
                    post.setVideoUrl(videoUrl);
                } else {
                    throw new IllegalArgumentException("Invalid video file or duration exceeds 30 seconds");
                }
            }
            
            Post savedPost = postRepository.save(post);
            return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
            
        } catch (Exception e) {
            throw new RuntimeException("Error creating post with media: " + e.getMessage(), e);
        }
    }
    
    /**
     * Update an existing post
     * 
     * @param postId Post ID
     * @param images Multiple image files (up to 3, optional)
     * @param video Video file (optional)
     * @param title Post title
     * @param content Post content
     * @param userId User ID
     * @return The updated post
     */
    @PostMapping("/posts/{postId}/edit")
    public ResponseEntity<Post> editPost(
            @PathVariable String postId,
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) MultipartFile video,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam String userId) {
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        // Verify user owns the post
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("User not authorized to edit this post");
        }

        post.setTitle(title);
        post.setContent(content);

        try {
            // Update images if provided
            if (images != null && images.length > 0) {
                post.getImageUrls().clear();
                int imageCount = Math.min(images.length, 3);
                for (int i = 0; i < imageCount; i++) {
                    if (!images[i].isEmpty() && isValidImageType(images[i])) {
                        String imageUrl = saveFile(images[i], "images");
                        post.getImageUrls().add(imageUrl);
                    }
                }
            }

            // Update video if provided
            if (video != null && !video.isEmpty()) {
                if (isValidVideoType(video) && isValidVideoDuration(video)) {
                    String videoUrl = saveFile(video, "videos");
                    post.setVideoUrl(videoUrl);
                }
            }

            Post updatedPost = postRepository.save(post);
            return ResponseEntity.ok(updatedPost);
        } catch (IOException e) {
            logger.error("Error updating post media: ", e);
            throw new RuntimeException("Error updating post media: " + e.getMessage());
        }
    }
    
    /**
     * Delete a post
     * 
     * @param postId Post ID
     * @param userId User ID
     * @return Success message
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        // Verify user owns the post
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("User not authorized to delete this post");
        }
        
        postRepository.delete(post);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Post deleted successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Helper method to save file and return URL
     */
    private String saveFile(MultipartFile file, String directory) throws IOException {
        try {
            // Create absolute base directory path
            Path baseDir = Paths.get(baseUploadDir).toAbsolutePath().normalize();
            
            // Create directory path
            Path targetDir = baseDir.resolve(directory).normalize();
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
                logger.info("Created directory: {}", targetDir);
            }
            
            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "_" + originalFilename;
            
            // Create full file path
            Path targetPath = targetDir.resolve(fileName).normalize();
            
            // Validate path is within upload directory
            if (!targetPath.startsWith(baseDir)) {
                throw new IOException("Cannot store file outside upload directory.");
            }
            
            logger.info("Attempting to save file to: {}", targetPath);
            
            // Save file
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Successfully saved file: {}", fileName);
            
            // Return relative URL path
            String relativePath = baseDir.relativize(targetPath).toString().replace('\\', '/');
            return "/uploads/" + relativePath;

        } catch (NoSuchFileException e) {
            logger.error("Upload directory does not exist", e);
            throw new IOException("Failed to create upload directory", e);
        } catch (IOException e) {
            logger.error("Failed to save file", e);
            throw new IOException("Failed to save file: " + e.getMessage(), e);
        }
    }
    
    /**
     * Check if file is a valid image type
     */
    private boolean isValidImageType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }
    
    /**
     * Check if file is a valid video type
     */
    private boolean isValidVideoType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("video/");
    }
    
    /**
     * Check if video duration is within limits (30 seconds)
     */
    private boolean isValidVideoDuration(MultipartFile video) {
        // For a complete implementation, you would use a library like Xuggler or JavaCV
        // to check the video duration, but for simplicity, we'll just check file size
        // assuming a rough 1MB per 10 seconds of video at moderate quality
        long maxSize = 3 * 1024 * 1024; // 3MB ~ 30 seconds
        return video.getSize() <= maxSize;
    }
    
    /**
     * Get all posts
     * 
     * @return List of posts
     */
    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return ResponseEntity.ok(posts);
    }
    
    /**
     * Get post by ID
     * 
     * @param postId Post ID
     * @return Post details
     */
    @GetMapping("/posts/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        return ResponseEntity.ok(post);
    }
    
    /**
     * Get posts by user ID
     * 
     * @param userId User ID
     * @return List of posts by the user
     */
    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable String userId) {
        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
        List<Post> posts = postRepository.findByUserId(userId);
        return ResponseEntity.ok(posts);
    }
}

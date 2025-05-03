package com.university.skillshare_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageConfig.class);

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            
            // Create media subdirectories
            Files.createDirectories(uploadPath.resolve("images"));
            Files.createDirectories(uploadPath.resolve("videos"));
            
            logger.info("Created upload directories at: {}", uploadPath);
            logger.info("Images directory: {}", uploadPath.resolve("images"));
            logger.info("Videos directory: {}", uploadPath.resolve("videos"));
        } catch (IOException e) {
            logger.error("Could not create upload directories", e);
            throw new RuntimeException("Could not create upload directories", e);
        }
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadUrl = uploadPath.toUri().toASCIIString();
        
        registry.addResourceHandler("/uploads/**")
               .addResourceLocations(uploadUrl)
               .setCachePeriod(3600)
               .resourceChain(true);
               
        logger.info("Configured resource handler: /uploads/** -> {}", uploadUrl);
    }
}

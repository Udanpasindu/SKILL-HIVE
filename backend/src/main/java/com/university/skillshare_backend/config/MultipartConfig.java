package com.university.skillshare_backend.config;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.beans.factory.annotation.Value;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class MultipartConfig {
    private static final Logger logger = LoggerFactory.getLogger(MultipartConfig.class);

    @Value("${java.io.tmpdir}")
    private String tmpLocation;

    @Value("${file.upload-dir:./uploads}")
    private String uploadLocation;

    @PostConstruct
    public void init() throws IOException {
        // Create temp directory
        File temp = new File(tmpLocation);
        if (!temp.exists()) {
            temp.mkdirs();
        }

        // Create upload directories
        Path uploadPath = Paths.get(uploadLocation).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        Files.createDirectories(uploadPath.resolve("images"));
        Files.createDirectories(uploadPath.resolve("videos"));
        
        logger.info("Created upload directories at: {}", uploadPath);
    }

    @Bean
    public MultipartResolver multipartResolver() {
        StandardServletMultipartResolver resolver = new StandardServletMultipartResolver();
        resolver.setResolveLazily(true);
        return resolver;
    }

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofMegabytes(10));
        factory.setMaxRequestSize(DataSize.ofMegabytes(15));
        factory.setFileSizeThreshold(DataSize.ofKilobytes(100));
        factory.setLocation(tmpLocation);
        return factory.createMultipartConfig();
    }
}

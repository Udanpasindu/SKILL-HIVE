package com.university.skillshare_backend.config;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;

@Configuration
public class MultipartConfig {

    @Value("${java.io.tmpdir}")
    private String tmpLocation;

    @Value("${file.upload-dir:./uploads}")
    private String uploadLocation;

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
        
        File temp = new File(tmpLocation);
        if (!temp.exists()) {
            temp.mkdirs();
        }
        factory.setLocation(temp.getAbsolutePath());
        
        File upload = new File(uploadLocation);
        if (!upload.exists()) {
            upload.mkdirs();
        }
        
        return factory.createMultipartConfig();
    }
}

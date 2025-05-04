package com.university.skillshare_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(exclude = {
    MongoAutoConfiguration.class,
    MongoDataAutoConfiguration.class
})
@EnableMongoRepositories(basePackages = "com.university.skillshare_backend.repository")
public class SkillshareBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SkillshareBackendApplication.class, args);
        System.out.println("SKILLHIVE backend is running!");
    }
}

package com.university.skillshare_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
public class SkillshareBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkillshareBackendApplication.class, args);
		System.out.println("Skillshare backend is running!");
	}

}

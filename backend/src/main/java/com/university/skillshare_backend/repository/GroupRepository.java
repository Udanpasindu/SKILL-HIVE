package com.university.skillshare_backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.university.skillshare_backend.model.Group;

public interface GroupRepository extends MongoRepository<Group, String> {
}

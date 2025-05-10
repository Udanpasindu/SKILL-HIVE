package com.university.skillshare_backend.repository;

import com.university.skillshare_backend.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByMembersContains(String userId);
}

package com.university.skillshare_backend.repository;

import com.university.skillshare_backend.model.SharedPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SharedPostRepository extends MongoRepository<SharedPost, String> {
    List<SharedPost> findByGroupId(String groupId);
    List<SharedPost> findByPostId(String postId);
}

package com.university.skillshare_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.university.skillshare_backend.model.Notification;
import com.university.skillshare_backend.model.Notification.NotificationType;
import com.university.skillshare_backend.repository.NotificationRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    public NotificationService(
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }
    
    /**
     * Get all notifications for a user
     */
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadIsFalseOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Count unread notifications
     */
    public long countUnreadNotifications(String userId) {
        return notificationRepository.countByUserIdAndReadIsFalse(userId);
    }
    
    /**
     * Mark a notification as read
     */
    public Notification markAsRead(String notificationId) {
        Optional<Notification> optNotification = notificationRepository.findById(notificationId);
        if (optNotification.isPresent()) {
            Notification notification = optNotification.get();
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        throw new RuntimeException("Notification not found");
    }
    
    /**
     * Mark a notification as unread
     */
    public Notification markAsUnread(String notificationId) {
        Optional<Notification> optNotification = notificationRepository.findById(notificationId);
        if (optNotification.isPresent()) {
            Notification notification = optNotification.get();
            notification.setRead(false);
            return notificationRepository.save(notification);
        }
        throw new RuntimeException("Notification not found");
    }
    
    /**
     * Mark all user notifications as read
     */
    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadIsFalse(userId);
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }
    
    /**
     * Delete a notification
     */
    public void deleteNotification(String notificationId) {
        if (notificationId == null || notificationId.isEmpty()) {
            throw new IllegalArgumentException("Notification ID cannot be null or empty");
        }
        
        // Check if notification exists before deleting
        boolean exists = notificationRepository.existsById(notificationId);
        if (!exists) {
            throw new RuntimeException("Notification with ID " + notificationId + " not found");
        }
        
        notificationRepository.deleteById(notificationId);
    }
    
    /**
     * Create a new notification
     */
    public Notification createNotification(String userId, String title, String message, 
                                          NotificationType type, String relatedItemId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedItemId(relatedItemId);
        notification.setRead(false);
        notification.setCreatedAt(new Date());
        
        notification = notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/notifications", 
            notification
        );
        
        return notification;
    }
    
    /**
     * Create a system notification
     */
    public Notification createSystemNotification(String userId, String title, String message) {
        return createNotification(userId, title, message, NotificationType.SYSTEM, null);
    }
    
    /**
     * Create a mention notification
     */
    public Notification createMentionNotification(String userId, String mentionerName, String postId) {
        String title = "New Mention";
        String message = mentionerName + " mentioned you in a post";
        return createNotification(userId, title, message, NotificationType.MENTION, postId);
    }
    
    /**
     * Create a comment notification
     */
    public Notification createCommentNotification(String userId, String commenterName, String postId) {
        String title = "New Comment";
        String message = commenterName + " commented on your post";
        return createNotification(userId, title, message, NotificationType.COMMENT, postId);
    }
    
    /**
     * Create a like notification
     */
    public Notification createLikeNotification(String userId, String likerName, String postId) {
        String title = "New Like";
        String message = likerName + " liked your post";
        return createNotification(userId, title, message, NotificationType.LIKE, postId);
    }
    
    /**
     * Create a follow notification
     */
    public Notification createFollowNotification(String userId, String followerName, String followerId) {
        String title = "New Follower";
        String message = followerName + " started following you";
        return createNotification(userId, title, message, NotificationType.FOLLOW, followerId);
    }
}

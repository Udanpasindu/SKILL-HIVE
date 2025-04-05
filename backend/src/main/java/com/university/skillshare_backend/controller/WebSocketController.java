package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.university.skillshare_backend.service.WebSocketService;

import java.util.Map;

@Controller
public class WebSocketController {

    private final WebSocketService webSocketService;

    @Autowired
    public WebSocketController(WebSocketService webSocketService) {
        this.webSocketService = webSocketService;
    }

    /**
     * Handle client connection join event
     * 
     * @param message Message from client
     * @param headerAccessor STOMP header accessor
     * @return Message to broadcast to subscribed clients
     */
    @MessageMapping("/join")
    @SendTo("/topic/public")
    public Map<String, Object> join(@Payload Map<String, Object> message, 
                                   SimpMessageHeaderAccessor headerAccessor) {
        // Add username to WebSocket session
        headerAccessor.getSessionAttributes().put("username", message.get("sender"));
        return message;
    }

    /**
     * Handle client like events
     * 
     * @param message Message containing postId
     * @return Message to broadcast
     */
    @MessageMapping("/like")
    @SendTo("/topic/activity")
    public Map<String, Object> handleLike(@Payload Map<String, Object> message) {
        // Just relay the message with a timestamp
        message.put("timestamp", System.currentTimeMillis());
        return message;
    }
}

package com.university.skillshare_backend.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.skillshare_backend.model.Comment;
import com.university.skillshare_backend.service.CommentService;

@WebMvcTest(CommentController.class)
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CommentService commentService;

    private Comment testComment;

    @BeforeEach
    public void setup() {
        testComment = new Comment();
        testComment.setId("comment123");
        testComment.setPostId("post123");
        testComment.setUserId("user123");
        testComment.setText("This is a test comment");
        testComment.setCreatedAt(LocalDateTime.now());
    }

    @Test
    public void testGetCommentsByPostId() throws Exception {
        // Given
        when(commentService.getCommentsByPostId("post123"))
                .thenReturn(Arrays.asList(testComment));

        // When
        ResultActions result = mockMvc.perform(get("/api/posts/post123/comments")
                .contentType(MediaType.APPLICATION_JSON));

        // Then
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("comment123"))
                .andExpect(jsonPath("$[0].text").value("This is a test comment"));
    }

    @Test
    public void testAddComment() throws Exception {
        // Given
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("text", "New comment");

        when(commentService.addComment(eq("post123"), eq("user123"), anyString()))
                .thenReturn(testComment);

        // When
        ResultActions result = mockMvc.perform(post("/api/posts/post123/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .param("userId", "user123")
                .content(objectMapper.writeValueAsString(requestBody)));

        // Then
        result.andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("comment123"));
    }
}

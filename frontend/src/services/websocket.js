import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;

/**
 * Connect to WebSocket for a specific post
 * 
 * @param {string} postId - The post ID to subscribe to
 * @param {object} callbacks - Object with callback functions for different events
 * @param {function} callbacks.onLikeUpdate - Called when like count updates
 * @param {function} callbacks.onNewComment - Called when a new comment is added
 * @param {function} callbacks.onCommentUpdate - Called when a comment is updated/deleted
 * @returns {function} - Cleanup function to disconnect
 */
export const connectWebSocket = (postId, callbacks = {}) => {
  const socket = new SockJS('http://localhost:8081/ws');
  stompClient = Stomp.over(socket);
  
  // Disable debug logs
  stompClient.debug = null;
  
  stompClient.connect({}, () => {
    console.log('WebSocket connected for post:', postId);
    
    // Subscribe to like updates
    if (callbacks.onLikeUpdate) {
      stompClient.subscribe(`/topic/likes/${postId}`, (message) => {
        const data = JSON.parse(message.body);
        callbacks.onLikeUpdate(data);
      });
    }
    
    // Subscribe to new comments
    if (callbacks.onNewComment) {
      stompClient.subscribe(`/topic/comments/${postId}`, (message) => {
        const data = JSON.parse(message.body);
        callbacks.onNewComment(data);
      });
    }
    
    // Subscribe to comment updates (edit/delete)
    if (callbacks.onCommentUpdate) {
      stompClient.subscribe(`/topic/comments/${postId}/updates`, (message) => {
        const data = JSON.parse(message.body);
        callbacks.onCommentUpdate(data);
      });
    }
  }, (error) => {
    console.error('WebSocket connection error:', error);
  });
  
  // Return cleanup function
  return () => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
      console.log('WebSocket disconnected');
    }
  };
};

/**
 * Check if WebSocket is connected
 * 
 * @returns {boolean} - True if connected, false otherwise
 */
export const isConnected = () => {
  return stompClient && stompClient.connected;
};

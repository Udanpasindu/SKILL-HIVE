import { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const useWebSocket = (postId) => {
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    if (!postId) return;
    
    // Configure SockJS to use credentials
    const socket = new SockJS('http://localhost:8081/ws', null, {
      transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
      withCredentials: true
    });
    
    const stompClient = Stomp.over(socket);
    stompClient.debug = null; // Disable debug logs
    
    const onConnect = () => {
      console.log('WebSocket connected for post:', postId);
      setConnected(true);
      
      // Subscribe to post activity topic
      stompClient.subscribe(`/topic/posts/${postId}/activity`, (message) => {
        const activity = JSON.parse(message.body);
        
        if (activity.type === 'LIKE') {
          setLikeCount(activity.likeCount);
        } else if (activity.type === 'COMMENT') {
          if (activity.comment) {
            setComments(prev => [...prev, activity.comment]);
          }
        }
      });
    };
    
    const onError = (error) => {
      console.error('WebSocket connection error:', error);
      setTimeout(() => {
        if (stompClient && stompClient.connected) return;
        stompClient.connect({}, onConnect, onError);
      }, 5000);
    };
    
    stompClient.connect({}, onConnect, onError);
    
    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [postId]);
  
  // Function to add a comment locally
  const addLocalComment = (commentId) => {
    // This would be called when a user adds a comment
    // The actual comment data will come from the WebSocket
  };
  
  return {
    likeCount,
    comments,
    connected,
    addLocalComment
  };
};

export default useWebSocket;

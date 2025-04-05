import { useState, useEffect } from 'react';
import { connectWebSocket } from '../services/websocket';

/**
 * Custom hook for WebSocket connections to monitor a post
 * 
 * @param {string} postId - The post ID to monitor
 * @returns {object} - State values for likes and comments
 */
export const useWebSocket = (postId) => {
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!postId) return;
    
    // Define callback handlers
    const callbacks = {
      // Handle like updates
      onLikeUpdate: (data) => {
        setLikeCount(data.likeCount);
      },
      
      // Handle new comments
      onNewComment: (newComment) => {
        setComments(prevComments => [...prevComments, newComment]);
      },
      
      // Handle comment updates (edit/delete)
      onCommentUpdate: (update) => {
        if (update.deleted) {
          // Handle comment deletion
          setComments(prevComments => 
            prevComments.filter(comment => comment.id !== update.deleted)
          );
        } else {
          // Handle comment edit
          setComments(prevComments => 
            prevComments.map(comment => 
              comment.id === update.id ? update : comment
            )
          );
        }
      }
    };
    
    // Connect to WebSocket
    const disconnect = connectWebSocket(postId, callbacks);
    
    // Cleanup on unmount
    return disconnect;
  }, [postId]);
  
  return { likeCount, comments };
};

export default useWebSocket;

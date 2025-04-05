import { useState, useEffect } from 'react';
import { connectWebSocket } from '../services/websocket';

/**
 * Custom hook for WebSocket connections to monitor a post
 * 
 * @param {string} postId - The post ID to monitor
 * @param {array} initialComments - Initial comments to set
 * @returns {object} - State values for likes and comments
 */
export const useWebSocket = (postId, initialComments = []) => {
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    if (!postId) return;
    
    const callbacks = {
      onLikeUpdate: (data) => {
        setLikeCount(data.likeCount);
      },
      
      onNewComment: (comment) => {
        setComments(prev => {
          // Check if comment already exists to avoid duplicates
          if (!prev.some(c => c.id === comment.id)) {
            return [...prev, comment];
          }
          return prev;
        });
      },
      
      onCommentUpdate: (update) => {
        if (update.deleted) {
          setComments(prev => prev.filter(c => c.id !== update.deleted));
        } else {
          setComments(prev => prev.map(c => c.id === update.id ? update : c));
        }
      }
    };
    
    const disconnect = connectWebSocket(postId, callbacks);
    return disconnect;
  }, [postId]);
  
  // Add effect to sync with initial comments
  useEffect(() => {
    if (initialComments && initialComments.length > 0) {
      setComments(initialComments);
    }
  }, [initialComments]);

  return { likeCount, comments, setComments };
};

export default useWebSocket;

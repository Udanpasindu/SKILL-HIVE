import { useState, useEffect, useRef } from 'react';
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
  // Keep track of locally added comment IDs
  const locallyAddedComments = useRef(new Set());

  useEffect(() => {
    if (!postId) return;
    
    const callbacks = {
      onLikeUpdate: (data) => {
        setLikeCount(data.likeCount);
      },
      
      onNewComment: (comment) => {
        // Check if this comment was already added locally
        if (locallyAddedComments.current.has(comment.id)) {
          return; // Skip adding duplicate comments
        }
        
        setComments(prev => {
          // Double check to avoid duplicates
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

  return { 
    likeCount, 
    comments, 
    setComments,
    addLocalComment: (commentId) => {
      locallyAddedComments.current.add(commentId);
      // Mark the comment as new for animation
      setComments(prev => prev.map(c => 
        c.id === commentId ? {...c, isNew: true} : c
      ));
    }
  };
};

export default useWebSocket;

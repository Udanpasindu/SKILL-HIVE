import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getComments } from '../services/api';
import CommentItem from './CommentItem';
import useWebSocket from '../hooks/useWebSocket';

const CommentList = forwardRef(({ postId, userId, initialComments = [] }, ref) => {
  const [loading, setLoading] = useState(false);
  const { comments, setComments } = useWebSocket(postId, initialComments);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addComment: (newComment) => {
      setComments(prev => [...prev, newComment]);
    }
  }));

  // Initial fetch of comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      setLoading(true);
      try {
        const data = await getComments(postId);
        setComments(data); // Update with fetched comments
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [postId]);

  // Handle comment deletion
  const handleDelete = (commentId) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };
  
  // Handle comment update
  const handleUpdate = (updatedComment) => {
    setComments(prev => prev.map(comment => 
      comment.id === updatedComment.id ? updatedComment : comment
    ));
  };
  
  // Add a new comment to the list
  const addComment = (newComment) => {
    setComments(prev => [...prev, newComment]);
  };
  
  if (loading) {
    return <div className="mt-4 text-sm text-gray-500">Loading comments...</div>;
  }
  
  return (
    <div className="mt-4 space-y-3">
      <h3 className="font-medium text-gray-700">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>
      
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
      ) : (
        comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            userId={userId}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))
      )}
    </div>
  );
});

export default CommentList;

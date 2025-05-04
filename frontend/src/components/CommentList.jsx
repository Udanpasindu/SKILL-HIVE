import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getComments } from '../services/api';
import CommentItem from './CommentItem';

const CommentList = forwardRef(({ postId, userId, postOwnerId, initialComments = [] }, ref) => {
  const [loading, setLoading] = useState(false);
  const [lastAddedCommentId, setLastAddedCommentId] = useState(null);
  const [comments, setComments] = useState(initialComments); // Use initialComments directly
  const [animatingOutId, setAnimatingOutId] = useState(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addComment: (newComment) => {
      setLastAddedCommentId(newComment.id);
      setComments(prev => [...prev, {...newComment, isNew: true}]);
      
      // Clear the "new" flag after some time
      setTimeout(() => {
        setComments(prev => prev.map(comment => 
          comment.id === newComment.id ? {...comment, isNew: false} : comment
        ));
      }, 3000);
    }
  }));

  // Initial fetch of comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      setLoading(true);
      try {
        const data = await getComments(postId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if no initial comments provided or force refresh
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [postId, initialComments.length]);

  // Handle comment deletion with animation
  const handleDelete = (commentId) => {
    // Start deletion animation
    setAnimatingOutId(commentId);
    
    // Remove comment after animation completes
    setTimeout(() => {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setAnimatingOutId(null);
    }, 500);
  };
  
  // Handle comment update
  const handleUpdate = (updatedComment) => {
    setComments(prev => prev.map(comment => 
      comment.id === updatedComment.id ? {...updatedComment, isUpdated: true} : comment
    ));
    
    // Clear the "updated" flag after some time
    setTimeout(() => {
      setComments(prev => prev.map(comment => 
        comment.id === updatedComment.id ? {...comment, isUpdated: false} : comment
      ));
    }, 2000);
  };

  if (loading) {
    return (
      <div className="mt-4 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-medium text-gray-800 flex items-center">
        <span className="mr-2">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </span>
        {comments.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </h3>
      
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 p-4 border border-dashed border-gray-300 rounded-lg text-center fade-in">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map(comment => (
              <div
                key={comment.id}
                className={`
                  transition-all duration-500 ease-in-out
                  ${comment.id === lastAddedCommentId ? 'animate-slide-in' : ''}
                  ${animatingOutId === comment.id ? 'animate-slide-out opacity-0 transform translate-x-full' : ''}
                `}
              >
                <CommentItem
                  comment={comment}
                  userId={userId}
                  postOwnerId={postOwnerId}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  isNew={comment.isNew || comment.id === lastAddedCommentId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default CommentList;

import { useRef } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

const Comments = ({ postId, userId, postOwnerId, initialComments = [] }) => {
  const commentListRef = useRef();
  
  const handleCommentAdded = (newComment) => {
    if (commentListRef.current) {
      commentListRef.current.addComment(newComment);
    }
  };

  return (
    <div className="mt-4">
      {/* Only render CommentForm if user is logged in */}
      {userId && (
        <CommentForm 
          postId={postId} 
          userId={userId} 
          onCommentAdded={handleCommentAdded} 
        />
      )}
      <CommentList 
        ref={commentListRef}
        postId={postId} 
        userId={userId}
        postOwnerId={postOwnerId}
        initialComments={initialComments} 
      />
    </div>
  );
};

export default Comments;

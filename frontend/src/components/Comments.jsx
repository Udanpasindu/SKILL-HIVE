import { useRef } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

const Comments = ({ postId, userId, initialComments = [] }) => {
  const commentListRef = useRef();
  
  const handleCommentAdded = (newComment) => {
    if (commentListRef.current) {
      commentListRef.current.addComment(newComment);
    }
  };

  return (
    <div className="mt-4">
      <CommentForm 
        postId={postId} 
        userId={userId} 
        onCommentAdded={handleCommentAdded} 
      />
      <CommentList 
        ref={commentListRef}
        postId={postId} 
        userId={userId} 
        initialComments={initialComments} 
      />
    </div>
  );
};

export default Comments;

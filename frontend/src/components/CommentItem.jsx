import { useState } from 'react';
import { deleteComment } from '../services/api';
import { parseMentions } from '../utils/mentionParser';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, userId, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isOwner = userId === comment.userId;
  const formattedDate = new Date(comment.createdAt).toLocaleString();
  
  const handleDelete = async () => {
    if (!isOwner || isDeleting) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    
    try {
      await deleteComment(comment.id, userId);
      if (onDelete) {
        onDelete(comment.id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setIsDeleting(false);
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleUpdate = (updatedComment) => {
    if (onUpdate) {
      onUpdate(updatedComment);
    }
    setIsEditing(false);
  };
  
  return (
    <div className="bg-gray-50 p-3 rounded-md">
      {isEditing ? (
        <CommentForm
          commentId={comment.id}
          userId={userId}
          initialText={comment.text}
          isEditing={true}
          onCommentAdded={handleUpdate}
          onCancelEdit={handleCancelEdit}
        />
      ) : (
        <>
          <div className="flex justify-between">
            <div className="flex flex-col">
              <p className="text-sm break-words">{parseMentions(comment.text)}</p>
              <span className="text-xs text-gray-500 mt-1">{formattedDate}</span>
            </div>
            
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="text-xs text-gray-500 hover:text-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`text-xs text-gray-500 hover:text-red-500 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentItem;

import { useState, useEffect } from 'react';
import { deleteComment } from '../services/api';
import { parseMentions } from '../utils/mentionParser';
import { formatDate } from '../utils/dateUtils';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, userId, postOwnerId, onDelete, onUpdate, isNew }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(isNew);
  
  const isCommentOwner = userId === comment.userId;
  const isPostOwner = userId === postOwnerId;
  const canDelete = isCommentOwner || isPostOwner;
  const canEdit = isCommentOwner; // Only comment owner can edit
  
  // Fix the date formatting with better error handling
  const getFormattedDate = () => {
    if (!comment || !comment.createdAt) return 'Just now';
    
    try {
      return formatDate(comment.createdAt) || 'Just now';
    } catch (error) {
      console.error('Error formatting comment date:', error);
      return 'Just now';
    }
  };
  
  // Highlight effect for new comments
  useEffect(() => {
    if (isNew) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;
    
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
  
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  return (
    <div className={`
      transform transition-all duration-500 ease-in-out
      ${isHighlighted ? 'bg-blue-50 scale-102 shadow-md' : 'bg-white hover:bg-gray-50'} 
      p-4 rounded-lg border border-gray-200 mb-3
      ${isDeleting ? 'opacity-50 scale-95' : 'opacity-100'}
    `}>
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
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {comment.authorName ? getInitials(comment.authorName) : 'U'}
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  {comment.authorName && (
                    <span className="font-medium text-sm text-gray-800 mb-1">
                      {comment.authorName}
                    </span>
                  )}
                  <p className="text-sm break-words leading-relaxed">{parseMentions(comment.text)}</p>
                  <span className="text-xs text-gray-500 mt-1">
                    {getFormattedDate()}
                  </span>
                </div>
                
                {(canDelete || canEdit) && (
                  <div className="group">
                    <div className="flex space-x-2 opacity-100 transition-opacity duration-200">
                      {canEdit && (
                        <button
                          onClick={handleEdit}
                          className="text-xs text-gray-500 hover:text-blue-500 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className={`text-xs text-gray-500 hover:text-red-500 transition-colors duration-200 ${
                            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CommentItem;

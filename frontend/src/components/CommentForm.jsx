import { useState } from 'react';
import { addComment, editComment } from '../services/api';
import MentionInput from './MentionInput';

const CommentForm = ({ postId, userId, commentId, initialText, isEditing, onCancelEdit, onCommentAdded }) => {
  const [text, setText] = useState(initialText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() || !userId || isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      let result;
      if (commentId && isEditing) {
        result = await editComment(commentId, userId, text);
        if (onCancelEdit) onCancelEdit();
      } else {
        result = await addComment(postId, userId, text);
        setText(''); // Clear form after successful submission
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 2000);
      }
      
      // Notify parent component about the new/updated comment
      if (onCommentAdded && result) {
        onCommentAdded({...result, isNew: true});
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setErrorMessage('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 relative">
      <div className={`
        flex flex-col space-y-2 transition-transform duration-300
        ${showSuccessAnimation ? 'animate-pulse bg-green-50 rounded-lg' : ''}
      `}>
        <MentionInput
          value={text}
          onChange={setText}
          placeholder="Write a comment... (use @ to mention users)"
          disabled={isSubmitting || !userId}
        />
        
        {errorMessage && (
          <p className="text-sm text-red-500 animate-pulse">{errorMessage}</p>
        )}
        
        <div className="flex justify-end space-x-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 transform hover:-translate-y-1"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting || !userId}
            className={`
              px-4 py-2 text-sm text-white rounded-md transition-all duration-300
              transform hover:-translate-y-1 focus:ring-2 focus:ring-offset-2
              ${!text.trim() || isSubmitting || !userId
                ? 'bg-blue-300 opacity-50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
              }
            `}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : isEditing ? 'Update' : 'Post Comment'}
          </button>
        </div>
      </div>
      
      {showSuccessAnimation && (
        <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 animate-ping">
          <div className="bg-green-500 text-white rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </form>
  );
};

export default CommentForm;

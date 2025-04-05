import { useState } from 'react';
import { addComment, editComment } from '../services/api';
import MentionInput from './MentionInput';

const CommentForm = ({ postId, userId, commentId, initialText, isEditing, onCancelEdit }) => {
  const [text, setText] = useState(initialText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() || !userId || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (commentId && isEditing) {
        await editComment(commentId, userId, text);
        if (onCancelEdit) onCancelEdit();
      } else {
        await addComment(postId, userId, text);
        setText(''); // Clear form after successful submission
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
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
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex flex-col space-y-2">
        <MentionInput
          value={text}
          onChange={setText}
          placeholder="Write a comment... (use @ to mention users)"
          disabled={isSubmitting || !userId}
        />
        
        <div className="flex justify-end space-x-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting || !userId}
            className={`px-3 py-1 text-sm text-white bg-blue-500 rounded-md ${
              !text.trim() || isSubmitting || !userId
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600'
            }`}
          >
            {isEditing ? 'Update' : 'Comment'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import useWebSocket from '../hooks/useWebSocket';
import { getUser, deletePost } from '../services/api';

const PostCard = ({ post, userId, detailed = false, onDelete }) => {
  const [authorName, setAuthorName] = useState('');
  const [showComments, setShowComments] = useState(detailed);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // Use WebSocket for real-time updates
  const { likeCount: wsLikeCount, comments: wsComments, addLocalComment } = useWebSocket(post.id);
  
  // Local state for likes and comments
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);
  
  const commentListRef = useRef();
  
  // Update like count from WebSocket
  useEffect(() => {
    if (wsLikeCount > 0) {
      setLocalLikeCount(wsLikeCount);
    }
  }, [wsLikeCount]);
  
  // Fetch author name
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUser(post.userId);
        setAuthorName(userData.fullName || userData.username);
      } catch (error) {
        console.error('Error fetching post author:', error);
      }
    };
    
    if (post.userId) {
      fetchAuthor();
    }
  }, [post.userId]);
  
  // Handle new comment added
  const handleCommentAdded = (newComment) => {
    console.log('Comment added:', newComment);
    // Register this comment as locally added to prevent duplication from WebSocket
    if (newComment && newComment.id) {
      addLocalComment(newComment.id);
    }
    
    if (commentListRef && commentListRef.current) {
      commentListRef.current.addComment(newComment);
    }
  };
  
  // Toggle comments section
  const toggleComments = () => {
    if (!detailed) {
      setShowComments(prev => !prev);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowDropdown(false);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent
        }),
      });

      if (response.ok) {
        post.content = editedContent;
        setIsEditing(false);
      } else {
        console.error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(post.content);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setIsDeleting(true);
        await deletePost(post.id);
        setDeleteSuccess(true);
        setShowDropdown(false);
        
        // Notify parent component about deletion
        if (onDelete) {
          onDelete(post.id);
        }
        
        // Show success message for 2 seconds before removing the post
        setTimeout(() => {
          setDeleteSuccess(false);
        }, 2000);
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (deleteSuccess) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
        <span className="block sm:inline">Post deleted successfully!</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {/* Post header */}
      <div className="flex justify-between mb-3">
        <div>
          <h3 className="font-medium">{post.title}</h3>
          <p className="text-sm text-gray-500">
            Posted by {authorName || 'Anonymous'} • 
            {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800"
          >
            <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor">
              <circle cx="2" cy="2" r="2"/>
              <circle cx="8" cy="2" r="2"/>
              <circle cx="14" cy="2" r="2"/>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
              <button 
                onClick={handleEdit}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <span className="material-icons text-base">edit</span>
                Edit Post
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
              >
                <span className="material-icons text-base text-red-600">
                  {isDeleting ? 'hourglass_empty' : 'delete'}
                </span>
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Post content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows="4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800">{post.content}</p>
        )}
      </div>
      
      {/* Post actions */}
      <div className="flex justify-between items-center border-t border-b py-2 my-2">
        <LikeButton
          postId={post.id}
          initialLikeCount={localLikeCount}
          userId={userId}
          onLikeUpdate={setLocalLikeCount}
        />
        
        <div className="flex gap-2">
          {!detailed && (
            <button
              onClick={toggleComments}
              className="inline-flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              <span className="material-icons text-base">comment</span>
              {showComments ? 'Hide Comments' : 'Show Comments'}
            </button>
          )}
        </div>
      </div>
      
      {/* Comments section */}
      {(showComments || detailed) && (
        <div className="mt-3 border-t pt-3">
          {/* Comment form */}
          <CommentForm 
            postId={post.id} 
            userId={userId} 
            onCommentAdded={handleCommentAdded}
          />
          
          {/* Comment list */}
          <CommentList 
            ref={commentListRef}
            postId={post.id} 
            userId={userId}
            postOwnerId={post.userId}
            initialComments={wsComments}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;

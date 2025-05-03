import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import useWebSocket from '../hooks/useWebSocket';
import { getUser, deletePost, editPost, getReactions } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import ShareModal from './ShareModal';
import ReactionButton from './ReactionButton';
import ReactionDisplay from './ReactionDisplay';

const PostCard = ({ post, userId, detailed = false, onDelete }) => {
  const [authorName, setAuthorName] = useState('');
  const [showComments, setShowComments] = useState(detailed);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reactionCounts, setReactionCounts] = useState({});
  const [totalReactions, setTotalReactions] = useState(0);
  
  // Use WebSocket for real-time updates
  const { likeCount: wsLikeCount, comments: wsComments, addLocalComment } = useWebSocket(post.id);
  
  // Local state for likes and comments
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);
  
  const commentListRef = useRef();
  
  const navigate = useNavigate();
  
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
  
  // Fetch reactions
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const data = await getReactions(post.id);
        setReactionCounts(data.counts || {});
        setTotalReactions(data.total || 0);
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };
    
    fetchReactions();
  }, [post.id]);

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
    setNewImages([]);
    setNewVideo(null);
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('userId', post.userId);
      formData.append('title', post.title);
      formData.append('content', editedContent);
      
      // Handle images
      if (newImages && newImages.length > 0) {
        newImages.forEach(image => {
          formData.append('images', image);
        });
      }
      
      // Handle video
      if (newVideo) {
        formData.append('video', newVideo);
      }

      const updatedPost = await editPost(post.id, formData);
      
      if (updatedPost) {
        // Update local post state
        Object.assign(post, {
          content: editedContent,
          imageUrls: updatedPost.imageUrls || post.imageUrls,
          videoUrl: updatedPost.videoUrl || post.videoUrl
        });
        
        // Reset form state
        setIsEditing(false);
        setNewImages([]);
        setNewVideo(null);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error.response?.data?.message || 'Failed to update post. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(post.content);
    setNewImages([]);
    setNewVideo(null);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setIsDeleting(true);
        await deletePost(post.id, userId);
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
        alert(error.response?.data?.message || 'Failed to delete post. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleReactionsUpdate = (reactionData) => {
    setReactionCounts(reactionData.counts || {});
    setTotalReactions(reactionData.total || 0);
  };

  // Navigate to post detail page
  const handlePostClick = (e) => {
    // Don't navigate if clicking on buttons or interactive elements
    if (
      e.target.closest('button') || 
      e.target.closest('a') || 
      e.target.closest('.dropdown-menu') ||
      e.target.closest('.share-modal') ||  // Add this to prevent navigation when clicking inside share modal
      showShareModal ||  // Don't navigate if share modal is open
      isEditing ||
      detailed // Don't navigate if already on detail page
    ) {
      return;
    }
    
    navigate(`/post/${post.id}`);
  };

  if (deleteSuccess) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
        <span className="block sm:inline">Post deleted successfully!</span>
      </div>
    );
  }

  // Helper function to check if post has media
  const hasMedia = () => {
    return (post.imageUrls && post.imageUrls.length > 0) || post.videoUrl;
  };
  
  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
    );
  };
  
  // Navigate to previous image
  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? post.imageUrls.length - 1 : prev - 1
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }
    setNewImages([...newImages, ...files]);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewVideo(file);
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 mb-4 ${!detailed ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}`}
      onClick={handlePostClick}
    >
      {/* Post header */}
      <div className="flex justify-between mb-3">
        <div>
          <h3 className="font-medium">{post.title}</h3>
          <p className="text-sm text-gray-500">
            Posted by {authorName || 'Anonymous'} • 
            {post.createdAt ? (
              <span className="date-display">{formatDate(post.createdAt) || 'Recent post'}</span>
            ) : (
              'Recent post'
            )}
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add/Replace Images (Max 3)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                multiple
                className="w-full p-2 border rounded-md"
                disabled={newImages.length >= 3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add/Replace Video
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="w-full p-2 border rounded-md"
                disabled={!!newVideo}
              />
            </div>
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
          <>
            <h3 className={`font-medium text-xl mb-2 ${!detailed ? 'text-indigo-600' : ''}`}>
              {post.title}
            </h3>
            <p className="text-gray-800">{post.content}</p>
          </>
        )}
      </div>
      
      {/* Media section */}
      {hasMedia() && (
        <div className="mb-4">
          {/* Video */}
          {post.videoUrl && (
            <div className="mb-3">
              <video 
                controls 
                className="w-full h-auto rounded-lg"
                src={`http://localhost:8081${post.videoUrl}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          {/* Images */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="relative">
              <img
                src={`http://localhost:8081${post.imageUrls[currentImageIndex]}`}
                alt={`Post image ${currentImageIndex + 1}`}
                className="w-full h-auto rounded-lg"
              />
              
              {/* Image navigation */}
              {post.imageUrls.length > 1 && (
                <>
                  <button 
                    onClick={prevImage} 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    &lt;
                  </button>
                  <button 
                    onClick={nextImage} 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    &gt;
                  </button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {post.imageUrls.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Post actions */}
      <div className="flex justify-between items-center border-t border-b py-2 my-2">
        <div className="flex items-center gap-2">
          {userId ? (
            <ReactionButton 
              postId={post.id}
              userId={userId}
              onReactionsUpdate={handleReactionsUpdate}
            />
          ) : (
            <div className="text-gray-600 text-sm px-3 py-1 flex items-center gap-1">
              <span className="material-icons text-base">thumb_up</span>
              <span>Like</span>
            </div>
          )}
          
          {/* Show reaction counts to everyone */}
          {totalReactions > 0 && (
            <ReactionDisplay reactionCounts={reactionCounts} />
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Show comment count to everyone */}
          <button
            onClick={userId ? toggleComments : () => {}}
            className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium
              ${userId ? 'text-gray-600 hover:text-blue-600 cursor-pointer' : 'text-gray-500 cursor-default'}
            `}
          >
            <span className="material-icons text-base">comment</span>
            <span>
              {wsComments?.length || 0} {(wsComments?.length || 0) === 1 ? 'Comment' : 'Comments'}
            </span>
          </button>
          
          {/* Share button - only for authenticated users */}
          {userId && (
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-green-600 text-sm font-medium"
            >
              <span className="material-icons text-base">share</span>
              Share to Group
            </button>
          )}
        </div>
      </div>

      {/* Comments section - only show toggle for authenticated users */}
      {userId && (showComments || detailed) && (
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

      {/* Read-only comments section for unauthenticated users */}
      {!userId && wsComments && wsComments.length > 0 && (
        <div className="mt-3 border-t pt-3">
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-sm text-gray-600 mb-2">
              <span className="material-icons text-xs align-middle mr-1">lock</span>
              Sign in to view and post comments
            </div>
            <div className="text-gray-500 text-xs">
              This post has {wsComments.length} comment{wsComments.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          postId={post.id}
          userId={userId}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            setShowShareModal(false);
            // Optionally show a success notification
          }}
          className="share-modal" // Add this class for targeting in the click handler
        />
      )}
    </div>
  );
};

export default PostCard;

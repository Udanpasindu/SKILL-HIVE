import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, editPost, deletePost, getReactions } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';
import Reactions from './Reactions';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import FollowButton from './FollowButton';
import ShareModal from './ShareModal';
import { formatDate } from '../utils/dateUtils';
import Comments from './Comments';

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

  const { likeCount: wsLikeCount, comments: wsComments, addLocalComment } = useWebSocket(post.id);

  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);

  const commentListRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (wsLikeCount > 0) {
      setLocalLikeCount(wsLikeCount);
    }
  }, [wsLikeCount]);

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

  const handleCommentAdded = (newComment) => {
    if (newComment && newComment.id) {
      addLocalComment(newComment.id);
    }

    if (commentListRef && commentListRef.current) {
      commentListRef.current.addComment(newComment);
    }
  };

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

      if (newImages && newImages.length > 0) {
        newImages.forEach(image => {
          formData.append('images', image);
        });
      }

      if (newVideo) {
        formData.append('video', newVideo);
      }

      const updatedPost = await editPost(post.id, formData);

      if (updatedPost) {
        Object.assign(post, {
          content: editedContent,
          imageUrls: updatedPost.imageUrls || post.imageUrls,
          videoUrl: updatedPost.videoUrl || post.videoUrl
        });

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

        if (onDelete) {
          onDelete(post.id);
        }

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

  const handlePostClick = (e) => {
    if (
      e.target.closest('button') ||
      e.target.closest('a') ||
      e.target.closest('.dropdown-menu') ||
      e.target.closest('.share-modal') ||
      showShareModal ||
      isEditing ||
      detailed
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

  const hasMedia = () => {
    return (post.imageUrls && post.imageUrls.length > 0) || post.videoUrl;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

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

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/800x400?text=Image+Not+Available';
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    return `http://localhost:8081${imageUrl}`;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 mb-4 ${!detailed ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}`}
      onClick={handlePostClick}
    >
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
        {post.userId && post.userId !== userId && (
          <FollowButton userId={post.userId} />
        )}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800"
          >
            <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor">
              <circle cx="2" cy="2" r="2" />
              <circle cx="8" cy="2" r="2" />
              <circle cx="14" cy="2" r="2" />
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
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p>{post.content}</p>
        )}
      </div>

      {hasMedia() && (
        <div className="relative">
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mb-4 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute top-1/2 left-0 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
              >
                &#8249;
              </button>
              <img
                src={getImageUrl(post.imageUrls[currentImageIndex])}
                alt={`Post Image ${currentImageIndex + 1}`}
                className="w-full h-60 object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute top-1/2 right-0 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
              >
                &#8250;
              </button>
            </div>
          )}
          {post.videoUrl && (
            <div className="mb-4">
              <video className="w-full h-60 object-cover rounded-lg" controls>
                <source src={post.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <Reactions
          reactionCounts={reactionCounts}
          totalReactions={totalReactions}
          postId={post.id}
          onReactionsUpdate={handleReactionsUpdate}
        />
      </div>

      <div className="flex gap-3 items-center">
        <button
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            toggleComments();
          }}
        >
          {showComments ? 'Hide Comments' : 'Show Comments'}
        </button>
        <button
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            setShowShareModal(true);
          }}
        >
          Share Post
        </button>
      </div>

      {showComments && (
        <div onClick={e => e.stopPropagation()}>
          <Comments 
            postId={post.id}
            userId={userId}
            postOwnerId={post.userId} 
            initialComments={post.comments || []}
          />
        </div>
      )}
      
      {showShareModal && (
        <div onClick={e => e.stopPropagation()}>
          <ShareModal 
            postId={post.id} 
            userId={userId} 
            onClose={() => setShowShareModal(false)} 
            onSuccess={() => setShowShareModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;

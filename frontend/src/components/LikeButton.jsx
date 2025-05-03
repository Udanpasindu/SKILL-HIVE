import { useState, useEffect } from 'react';
import { likePost, unlikePost, getLikeCount } from '../services/api';

const LikeButton = ({ postId, initialLikeCount = 0, userId, onLikeUpdate }) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user has already liked the post
  useEffect(() => { 
    const checkLikeStatus = async () => {
      if (!userId || !postId) return;

      try {
        const data = await getLikeCount(postId, userId);
        setLikeCount(data.likeCount);
        setIsLiked(data.hasLiked || false);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [postId, userId]);

  // Handle like/unlike
  const handleToggleLike = async () => {
    if (!userId || loading) return;

    setLoading(true);
    try {
      let response;
      
      if (isLiked) {
        response = await unlikePost(postId, userId);
        setIsLiked(false);
      } else {
        response = await likePost(postId, userId);
        setIsLiked(true);
      }
      
      setLikeCount(response.likeCount);
      if (onLikeUpdate) {
        onLikeUpdate(response.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggleLike}
      disabled={loading || !userId}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        isLiked 
          ? 'text-blue-600 hover:text-blue-800' 
          : 'text-gray-600 hover:text-blue-600'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="material-icons text-base">
        {isLiked ? 'favorite' : 'favorite_border'}
      </span>
      <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
};

export default LikeButton;

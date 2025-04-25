import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const FollowButton = ({ userId, initialFollowStatus = false, onStatusChange }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowStatus);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUser();

  useEffect(() => {
    // Check if the current user is already following this user
    const checkFollowStatus = async () => {
      if (!currentUser || !userId || userId === currentUser.id) return;
      
      try {
        const response = await axios.get(
          `http://localhost:8081/api/users/${currentUser.id}/following/${userId}`
        );
        setIsFollowing(response.data);
      } catch (error) {
        console.error('Error checking follow status:', error);
        setIsFollowing(false);
      }
    };

    checkFollowStatus();
  }, [currentUser, userId]);

  const handleToggleFollow = async () => {
    if (!currentUser || !userId || userId === currentUser.id || loading) return;

    setLoading(true);
    try {
      let response;
      
      if (isFollowing) {
        // Unfollow the user
        response = await axios.delete(
          `http://localhost:8081/api/users/${currentUser.id}/unfollow/${userId}`
        );
        setIsFollowing(false);
      } else {
        // Follow the user
        response = await axios.post(
          `http://localhost:8081/api/users/${currentUser.id}/follow/${userId}`
        );
        setIsFollowing(true);
      }
      
      // Notify parent component if provided
      if (onStatusChange) {
        onStatusChange(isFollowing ? false : true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || userId === currentUser.id) {
    return null; // Don't show button for the user's own posts/profile
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isFollowing 
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="material-icons text-sm">
        {isFollowing ? 'person_remove' : 'person_add'}
      </span>
      <span>{isFollowing ? 'Following' : 'Follow'}</span>
    </button>
  );
};

export default FollowButton;

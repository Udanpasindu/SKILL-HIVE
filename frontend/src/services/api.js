import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8081/api', // Using port 8081 as specified in your backend
});

// Like a post
export const likePost = async (postId, userId) => {
  try {
    const response = await api.post(`/posts/${postId}/like?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (postId, userId) => {
  try {
    const response = await api.delete(`/posts/${postId}/like?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Get like count for a post
export const getLikeCount = async (postId, userId) => {
  try {
    const response = await api.get(`/posts/${postId}/likes${userId ? `?userId=${userId}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error getting like count:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId, userId, text) => {
  try {
    const response = await api.post(`/posts/${postId}/comments?userId=${userId}`, { text });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Edit a comment
export const editComment = async (commentId, userId, text) => {
  try {
    const response = await api.put(`/comments/${commentId}?userId=${userId}`, { text });
    return response.data;
  } catch (error) {
    console.error('Error editing comment:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId, userId) => {
  try {
    const response = await api.delete(`/comments/${commentId}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Get all comments for a post
export const getComments = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

// Get post details
export const getPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting post details:', error);
    throw error;
  }
};

// Get user details
export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
};

// Search users (for @mentions)
export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Follow user
export const followUser = async (followerId, userId) => {
  try {
    const response = await api.post(`/users/${followerId}/follow/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

// Unfollow user
export const unfollowUser = async (followerId, userId) => {
  try {
    const response = await api.delete(`/users/${followerId}/unfollow/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

// Check if user is following another user
export const isFollowing = async (followerId, userId) => {
  try {
    const response = await api.get(`/users/${followerId}/following/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

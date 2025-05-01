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

export const getUserPosts = async (userId) => {
  const response = await fetch(`${API_URL}/posts/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return handleResponse(response);
};

export const editPost = async (postId, formData) => {
  try {
    // Change from PUT to POST to match backend expected method
    const response = await api.post(`/posts/${postId}/edit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // Increase timeout for large files
    });
    return response.data;
  } catch (error) {
    console.error('Error editing post:', error.response?.data || error.message);
    throw error;
  }
};

export const deletePost = async (postId, userId) => {
  try {
    const response = await api.delete(`/posts/${postId}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

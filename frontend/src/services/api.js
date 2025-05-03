import axios from 'axios';

// Create axios instance with base URL and proper CORS configuration
const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  withCredentials: false, // Set to false to match backend configuration
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token header if available
api.interceptors.request.use(config => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    try {
      const { id } = JSON.parse(user);
      config.headers['X-User-Id'] = id;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  return config;
});

// Add response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle CORS errors specifically
    if (error.message && error.message.includes('Network Error')) {
      console.error('CORS or network error detected:', error);
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error. User needs to login again.');
    }

    return Promise.reject(error);
  }
);

// Authentication functions
export const login = async (credentials) => {
  try {
    const response = await axios.post('http://localhost:8081/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post('http://localhost:8081/api/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Like/Unlike Post
export const likePost = async (postId, userId) => {
  try {
    const response = await api.post(`/posts/${postId}/like?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const unlikePost = async (postId, userId) => {
  try {
    const response = await api.delete(`/posts/${postId}/like?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Commenting on a Post
export const addComment = async (postId, userId, text) => {
  try {
    const response = await api.post(`/posts/${postId}/comments?userId=${userId}`, { text });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const editComment = async (commentId, userId, text) => {
  try {
    const response = await api.put(`/comments/${commentId}?userId=${userId}`, { text });
    return response.data;
  } catch (error) {
    console.error('Error editing comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId, userId) => {
  try {
    const response = await api.delete(`/comments/${commentId}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Post CRUD operations
export const createPost = async (formData) => {
  try {
    const response = await axios.post('http://localhost:8081/api/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const editPost = async (postId, formData) => {
  try {
    const response = await api.post(`/posts/${postId}/edit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error editing post:', error);
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

// Follow/Unfollow User
export const followUser = async (followerId, userId) => {
  try {
    const response = await api.post(`/users/${followerId}/follow/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (followerId, userId) => {
  try {
    const response = await api.delete(`/users/${followerId}/unfollow/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const isFollowing = async (followerId, userId) => {
  try {
    const response = await api.get(`/users/${followerId}/following/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

// Get User Posts
export const getUserPosts = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
};

// Get Post and Comments
export const getPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting post details:', error);
    throw error;
  }
};

export const getComments = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

// Verify Session
export const verifySession = async () => {
  try {
    const user = localStorage.getItem('currentUser');
    if (!user) return false;

    const { id } = JSON.parse(user);
    const response = await api.get(`/auth/verify/${id}`);
    return response.data.valid;
  } catch (error) {
    console.error('Session verification failed:', error);
    localStorage.removeItem('currentUser');
    return false;
  }
};

// Search Users
export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

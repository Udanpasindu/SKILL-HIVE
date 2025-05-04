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
    console.log('Attempting login with:', credentials.username);
    
    // Log request details for debugging
    console.log('Login request:', {
      url: 'http://localhost:8081/api/auth/login',
      data: { username: credentials.username, password: '******' },
      headers: { 'Content-Type': 'application/json' }
    });
    
    const response = await axios.post(
      'http://localhost:8081/api/auth/login',
      credentials,
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false
      }
    );
    
    console.log('Login response:', response.status, response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.response) {
      console.log('Error response data:', error.response.data);
      
      if (error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      } else if (error.response.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response.status === 404) {
        throw new Error('Server endpoint not found. Please check the API URL.');
      } else if (error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    }
    
    throw new Error('Login failed. Please try again later.');
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

// Reaction functions
export const getReactions = async (postId, userId) => {
  try {
    const url = userId 
      ? `http://localhost:8081/api/posts/${postId}/reactions?userId=${userId}`
      : `http://localhost:8081/api/posts/${postId}/reactions`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching reactions:', error);
    throw error;
  }
};

export const addReaction = async (postId, userId, type) => {
  try {
    const response = await axios.post(
      `http://localhost:8081/api/posts/${postId}/reactions?userId=${userId}&type=${type}`
    );
    return response.data;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

export const removeReaction = async (postId, userId, type) => {
  try {
    const response = await axios.delete(
      `http://localhost:8081/api/posts/${postId}/reactions?userId=${userId}&type=${type}`
    );
    return response.data;
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
};

// Get user by ID
export const getUser = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:8081/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
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

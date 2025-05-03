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
      // localStorage.removeItem('currentUser');
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'http://localhost:8081/api/auth/login',
      data: credentials,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false
    });
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Registration function
export const register = async (userData) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'http://localhost:8081/api/auth/register',
      data: userData,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false
    });
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.error || 'Registration failed';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

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
    const response = await axios.get(`http://localhost:8081/api/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
};

// Verify user session
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

// Fix getUserPosts which has undefined variables
export const getUserPosts = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
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

// Improved createPost function with better error handling
export const createPost = async (formData) => {
  try {
    console.log('Creating post with FormData:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
    }

    // Try direct post with proper headers
    try {
      console.log('Creating post with direct axios call...');
      const response = await axios.post('http://localhost:8081/api/posts', formData, {
        headers: {
          // Don't set Content-Type with FormData - browser will set it with boundary
          'Access-Control-Allow-Origin': 'http://localhost:3000', // Explicitly set origin to React app
        },
        withCredentials: false, // Disable credentials to avoid CORS issues
        timeout: 30000
      });
      console.log('Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating post with axios:', error);
      
      // Try with fetch API as a fallback
      console.log('Attempting with fetch API...');
      const fetchResponse = await fetch('http://localhost:8081/api/posts', {
        method: 'POST',
        body: formData,
        credentials: 'omit', // Don't include credentials in the request
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000'
        }
      });
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error(`Server error (${fetchResponse.status}):`, errorText);
        throw new Error(`Server error: ${fetchResponse.status}`);
      }
      
      const data = await fetchResponse.json();
      console.log('Post created successfully with fetch:', data);
      return data;
    }
  } catch (error) {
    console.error('All post creation methods failed:', error);
    throw error;
  }
};

// Add authentication status check function
export const checkAuthStatus = async () => {
  try {
    // Try a simple authenticated request to check login status
    const response = await api.get('/users/current');
    return { isAuthenticated: true, user: response.data };
  } catch (error) {
    console.error('Authentication check failed:', error);
    return { isAuthenticated: false, error };
  }
};

// Share post to a group
export const sharePostToGroup = async (postId, groupId, userId) => {
  try {
    const response = await axios.post(
      `http://localhost:8081/api/posts/${postId}/share?groupId=${groupId}&userId=${userId}`,
      {},
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sharing post:', error);
    throw error;
  }
};

// Get user's groups for sharing
export const getUserGroups = async (userId) => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/users/${userId}/groups`,
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user groups:', error);
    throw error;
  }
};

// Get shared posts for a group
export const getGroupSharedPosts = async (groupId) => {
  try {
    const response = await axios.get(`http://localhost:8081/api/groups/${groupId}/posts`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    console.error('Error getting group shared posts:', error);
    throw error;
  }
};

// Add a reaction to a post
export const addReaction = async (postId, userId, type) => {
  try {
    const response = await api.post(`/posts/${postId}/reactions?userId=${userId}&type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

// Remove a reaction from a post
export const removeReaction = async (postId, userId, type) => {
  try {
    const response = await api.delete(`/posts/${postId}/reactions?userId=${userId}&type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
};

// Get reactions for a post
export const getReactions = async (postId, userId = null) => {
  try {
    const url = userId 
      ? `/posts/${postId}/reactions?userId=${userId}`
      : `/posts/${postId}/reactions`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting reactions:', error);
    throw error;
  }
};

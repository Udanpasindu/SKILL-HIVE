import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { useUser } from '../contexts/UserContext';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch user profile data
        const userResponse = await axios.get(`http://localhost:8081/api/users/${userId}`);
        setProfileUser(userResponse.data);
        
        // Try this endpoint first
        try {
          const postsResponse = await axios.get(`http://localhost:8081/api/posts/user/${userId}`);
          setUserPosts(postsResponse.data);
        } catch (postError) {
          // If the first endpoint fails, try this alternative endpoint format
          console.log("Trying alternative endpoint for user posts");
          const alternativeResponse = await axios.get(`http://localhost:8081/api/users/${userId}/posts`);
          setUserPosts(alternativeResponse.data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse bg-white shadow-lg rounded-lg p-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <h2 className="text-red-600 text-xl font-medium mb-2">Error</h2>
          <p className="text-red-500 mb-4">{error || "User not found"}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-700 px-6 py-8 text-white">
          <div className="flex items-center mb-3">
            <div className="w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center text-2xl font-bold mr-4">
              {profileUser.username ? profileUser.username.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {profileUser.fullName || profileUser.username}
              </h1>
              <p className="text-blue-100">@{profileUser.username}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {profileUser.bio && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Bio</h2>
              <p className="text-gray-600">{profileUser.bio}</p>
            </div>
          )}
          
          {currentUser && currentUser.id === userId && (
            <Link to="/profile" className="text-blue-600 hover:text-blue-800">
              Edit Profile
            </Link>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Posts by {profileUser.fullName || profileUser.username}
          </h2>
        </div>
        
        <div className="p-4">
          {userPosts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>This user hasn't posted anything yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map(post => (
                <PostCard key={post.id} post={post} userId={currentUser?.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
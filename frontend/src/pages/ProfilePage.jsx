import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import FollowButton from '../components/FollowButton';
import axios from 'axios';
import UserPosts from '../components/UserPosts';

const ProfilePage = () => {
  const { currentUser, updateUser } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Add state for followers and following modal
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        username: currentUser.username || '',
      });

      // Fetch user's posts
      const fetchUserPosts = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(`http://localhost:8081/api/posts/user/${currentUser.id}`);
          setUserPosts(response.data);
        } catch (error) {
          console.error('Error fetching user posts:', error);
        } finally {
          setIsLoading(false);
        }
      };

      // Fetch follower and following counts
      const fetchFollowCounts = async () => {
        try {
          const followerResponse = await axios.get(`http://localhost:8081/api/users/${currentUser.id}/followers/count`);
          const followingResponse = await axios.get(`http://localhost:8081/api/users/${currentUser.id}/following/count`);

          setFollowerCount(followerResponse.data);
          setFollowingCount(followingResponse.data);
        } catch (error) {
          console.error('Error fetching follow counts:', error);
        }
      };

      fetchUserPosts();
      fetchFollowCounts();
    }
  }, [currentUser]);

  // Add functions to fetch followers and following lists
  const fetchFollowers = async () => {
    if (!currentUser) return;

    setLoadingUsers(true);
    try {
      const response = await axios.get(`http://localhost:8081/api/users/${currentUser.id}/followers`);
      setFollowers(response.data);
      setShowFollowersModal(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchFollowing = async () => {
    if (!currentUser) return;

    setLoadingUsers(true);
    try {
      const response = await axios.get(`http://localhost:8081/api/users/${currentUser.id}/following`);
      setFollowing(response.data);
      setShowFollowingModal(true);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Call API to update user profile
      const response = await axios.put(`http://localhost:8081/api/users/${currentUser.id}`, formData);

      // Update local state
      updateUser({
        ...currentUser,
        ...response.data,
      });

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 space-y-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            {/* Only show on other users' profiles */}
            {false && <FollowButton userId={currentUser?.id} />}
          </div>

          <div className="flex mt-4 text-white">
            <div className="mr-8 cursor-pointer" onClick={fetchFollowers}>
              <span className="block text-2xl font-bold">{followerCount}</span>
              <span className="text-sm opacity-80 hover:underline">Followers</span>
            </div>
            <div className="cursor-pointer" onClick={fetchFollowing}>
              <span className="block text-2xl font-bold">{followingCount}</span>
              <span className="text-sm opacity-80 hover:underline">Following</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {message.text && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === 'error'
                  ? 'bg-red-100 text-red-700 border border-red-400'
                  : 'bg-green-100 text-green-700 border border-green-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="mr-4 px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form to original values
                      setFormData({
                        fullName: currentUser.fullName || '',
                        email: currentUser.email || '',
                        username: currentUser.username || '',
                      });
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">My Posts</h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
          ) : userPosts.length === 0 ? (
            <p className="text-center text-gray-600">No posts available.</p>
          ) : (
            <UserPosts posts={userPosts} />
          )}
        </div>
      </div>

      {/* Modal for Followers */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-xl font-bold mb-4">Followers</h2>
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : followers.length === 0 ? (
              <p>No followers yet.</p>
            ) : (
              <ul>
                {followers.map((follower) => (
                  <li key={follower.id} className="py-2">
                    {follower.fullName}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 text-right">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowFollowersModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Following */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-xl font-bold mb-4">Following</h2>
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : following.length === 0 ? (
              <p>You're not following anyone yet.</p>
            ) : (
              <ul>
                {following.map((followee) => (
                  <li key={followee.id} className="py-2">
                    {followee.fullName}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 text-right">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowFollowingModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

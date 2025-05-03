import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import PostCard from '../components/PostCard';

const GroupPage = () => {
  const { groupId } = useParams();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: null
  });
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [memberDetails, setMemberDetails] = useState({});
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  useEffect(() => {
    if (group && currentUser) {
      setIsMember(group.members?.includes(currentUser.id));
      
      // If user is a member, fetch shared posts
      if (group.members?.includes(currentUser.id)) {
        fetchSharedPosts();
      }
      
      // Fetch member details
      fetchMemberDetails();
    }
  }, [group, currentUser]);

  const fetchGroupDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/groups/${groupId}`);
      setGroup(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description,
        photo: null
      });
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedPosts = async () => {
    if (!groupId) return;
    
    try {
      setLoadingPosts(true);
      const response = await axios.get(`http://localhost:8081/api/groups/${groupId}/posts`);
      setSharedPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching shared posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // New function to fetch member details
  const fetchMemberDetails = async () => {
    if (!group || !group.members || group.members.length === 0) return;
    
    setLoadingMembers(true);
    const details = {};
    
    try {
      // Fetch details for each member in parallel
      const promises = group.members.map(memberId => 
        axios.get(`http://localhost:8081/api/users/${memberId}`)
          .then(response => {
            details[memberId] = response.data;
          })
          .catch(error => {
            console.error(`Error fetching details for user ${memberId}:`, error);
            details[memberId] = { id: memberId, username: "Unknown" };
          })
      );
      
      await Promise.all(promises);
      setMemberDetails(details);
    } catch (error) {
      console.error('Error fetching member details:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData(prev => ({ ...prev, photo: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    if (formData.photo) {
      formDataToSend.append('photo', formData.photo);
    }

    try {
      await axios.put(`http://localhost:8081/api/groups/${groupId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchGroupDetails();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        await axios.post(`http://localhost:8081/api/groups/${groupId}/leave?userId=${currentUser.id}`);
        setIsMember(false);
        setSharedPosts([]); // Clear posts when leaving
      } else {
        await axios.post(`http://localhost:8081/api/groups/${groupId}/join?userId=${currentUser.id}`);
        setIsMember(true);
        fetchSharedPosts(); // Fetch posts when joining
      }
      // Refresh group details to get updated member list
      await fetchGroupDetails();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await axios.post(
        `http://localhost:8081/api/groups/${groupId}/remove-member?memberId=${memberId}&ownerId=${currentUser.id}`
      );
      await fetchGroupDetails();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const isOwner = group?.ownerId === currentUser?.id;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="relative h-64">
          <img 
            src={group.photoUrl || '/default-group-cover.jpg'} 
            alt={group.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Photo</label>
                <input
                  type="file"
                  name="photo"
                  onChange={handleChange}
                  accept="image/*"
                  className="mt-1 block w-full"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-gray-500 mt-2">{group.members?.length || 0} members</p>
              </div>
              {isOwner ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Edit Group
                </button>
              ) : (
                <button
                  onClick={handleJoinLeave}
                  className={`px-4 py-2 rounded-md ${
                    isMember 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isMember ? 'Leave Group' : 'Join Group'}
                </button>
              )}
            </div>
            <p className="mt-4 text-gray-600">{group.description}</p>
            
            {/* Members section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Members ({(group.members || []).length})</h2>
              {loadingMembers ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading members...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(group.members || []).map(memberId => {
                    const member = memberDetails[memberId] || { id: memberId, username: "Loading..." };
                    return (
                      <div key={memberId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            {member.username ? member.username[0].toUpperCase() : '?'}
                          </div>
                          <span>{member.username}</span>
                        </div>
                        {isOwner && memberId !== currentUser.id && (
                          <button
                            onClick={() => handleRemoveMember(memberId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Group shared posts section */}
        {isMember && (
          <div className="mt-8 px-6 pb-6">
            <h2 className="text-xl font-semibold mb-4">Shared Posts</h2>
            
            {loadingPosts ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-2 text-gray-600">Loading shared posts...</p>
              </div>
            ) : sharedPosts.length > 0 ? (
              <div className="space-y-6">
                {sharedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userId={currentUser?.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No posts have been shared in this group yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPage;

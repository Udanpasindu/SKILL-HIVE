import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const GroupCard = ({ group, onDelete, isOwner, onMembershipChange }) => {
  const [loading, setLoading] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useUser();
  // Fix: Check if the user's ID is in the members array directly
  const [isMember, setIsMember] = useState(group.members?.includes(currentUser?.id));

  useEffect(() => {
    fetchOwnerDetails();
  }, [group.ownerId]);

  const fetchOwnerDetails = async () => {
    if (!group.ownerId) return;
    
    try {
      setOwnerLoading(true);
      const response = await axios.get(`http://localhost:8081/api/users/${group.ownerId}`);
      setOwnerDetails(response.data);
    } catch (error) {
      console.error('Error fetching owner details:', error);
      setOwnerDetails({ username: "Unknown" });
    } finally {
      setOwnerLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8081/api/groups/${group.id}`);
      onDelete(group.id);
    } catch (error) {
      console.error('Error deleting group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    setLoading(true);
    try {
      if (isMember) {
        const response = await axios.post(`http://localhost:8081/api/groups/${group.id}/leave?userId=${currentUser.id}`);
        if (response.data) {
          setIsMember(false);
          // Update the group data with the response
          if (onMembershipChange) {
            onMembershipChange(response.data);
          }
        }
      } else {
        const response = await axios.post(`http://localhost:8081/api/groups/${group.id}/join?userId=${currentUser.id}`);
        if (response.data) {
          setIsMember(true);
          // Update the group data with the response
          if (onMembershipChange) {
            onMembershipChange(response.data);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img 
          src={group.photoUrl || '/default-group-cover.jpg'}
          alt={group.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 
          onClick={() => navigate(`/groups/${group.id}`)}
          className="text-xl font-semibold text-gray-800 hover:text-indigo-600 cursor-pointer"
        >
          {group.name}
        </h3>
        <p className="text-gray-600 mt-2">{group.description}</p>
        
        {/* Display group owner info */}
        <p className="text-sm text-gray-500 mt-1">
          Created by: {ownerLoading ? 'Loading...' : (ownerDetails?.username || 'Unknown')}
        </p>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {(group.members || []).length} members
          </span>
          {!isOwner && (
            <button
              onClick={handleJoinLeave}
              disabled={loading}
              className={`px-4 py-2 rounded-md ${
                isMember 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Processing...' : isMember ? 'Leave Group' : 'Join Group'}
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-red-600 hover:text-red-800"
            >
              {loading ? 'Deleting...' : 'Delete Group'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;

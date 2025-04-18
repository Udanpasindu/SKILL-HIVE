import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GroupCard = ({ group, onDelete, isOwner }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        {isOwner && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-red-600 hover:text-red-800"
            >
              {loading ? 'Deleting...' : 'Delete Group'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupCard;

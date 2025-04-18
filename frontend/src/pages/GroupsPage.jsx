import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import GroupForm from '../components/GroupForm';
import GroupCard from '../components/GroupCard';

const GroupsPage = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUser();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([...groups, newGroup]);
  };

  const handleGroupDeleted = (groupId) => {
    setGroups(groups.filter(group => group.id !== groupId));
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Groups</h1>
              <p className="text-indigo-100">Join and create groups to collaborate</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors"
            >
              Create Group
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No groups available.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Create your first group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onDelete={handleGroupDeleted}
                  isOwner={group.ownerId === currentUser?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateForm && (
        <GroupForm
          onClose={() => setShowCreateForm(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
};

export default GroupsPage;

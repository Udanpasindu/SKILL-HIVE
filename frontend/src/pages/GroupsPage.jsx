import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

const GroupsPage = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUser();

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    // TODO: Implement group creation logic
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group cards will go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;

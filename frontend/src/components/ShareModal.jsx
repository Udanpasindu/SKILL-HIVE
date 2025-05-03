import { useState, useEffect } from 'react';
import axios from 'axios';

const ShareModal = ({ postId, userId, onClose, onSuccess, className }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8081/api/users/${userId}/groups`);
        setGroups(response.data || []);
      } catch (err) {
        console.error('Error fetching user groups:', err);
        setError('Failed to load groups. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserGroups();
    }
  }, [userId]);

  const handleShare = async () => {
    if (!selectedGroup) {
      setError('Please select a group');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:8081/api/posts/${postId}/share?groupId=${selectedGroup}&userId=${userId}`
      );
      
      // Get the selected group name for the success message
      const selectedGroupName = groups.find(group => group.id === selectedGroup)?.name || 'the group';
      
      // First set the success message to ensure it's ready to display
      setSuccessMessage(`Post successfully shared to ${selectedGroupName}!`);
      
      // Then set success state to trigger the UI update
      setSuccess(true);
      console.log("Success state set to true, showing success message for:", selectedGroupName);
      
      // Notify parent component if needed
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500); // Slight delay to ensure success message is shown first
      }
      
      // Close after success message is shown - extended time for visibility
      setTimeout(() => {
        console.log("Closing modal after timeout");
        onClose();
      }, 4000); // Extended to 4 seconds for better visibility
    } catch (err) {
      console.error("Error sharing post:", err);
      setError(err.response?.data?.message || 'Failed to share post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 share-modal ${className || ''}`}
      onClick={(e) => {
        // Prevent clicks from bubbling up to parent elements
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Stop propagation here too
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Share Post to Group</h2>
          {!success && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <span className="material-icons">close</span>
            </button>
          )}
        </div>

        {success ? (
          <div className="bg-green-100 dark:bg-green-800 border-2 border-green-500 dark:border-green-700 text-green-700 dark:text-green-100 px-6 py-8 rounded-md mb-4 flex items-center animate-pulse shadow-lg z-50">
            <span className="material-icons text-green-600 dark:text-green-300 text-4xl mr-4">check_circle</span>
            <div>
              <p className="font-bold text-lg">{successMessage}</p>
              <p className="text-sm mt-2 text-green-600 dark:text-green-300">
                You'll be redirected back in a moment...
              </p>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Select Group
                  </label>
                  {groups.length > 0 ? (
                    <select
                      value={selectedGroup}
                      onChange={(e) => {
                        e.stopPropagation(); // Stop propagation on dropdown change
                        setSelectedGroup(e.target.value);
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      onClick={(e) => e.stopPropagation()} // Stop propagation on dropdown click
                    >
                      <option value="">-- Select a group --</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">You don't belong to any groups yet.</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={!selectedGroup || groups.length === 0}
                    className={`px-4 py-2 bg-blue-500 text-white rounded-md 
                      ${!selectedGroup || groups.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                  >
                    Share
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShareModal;

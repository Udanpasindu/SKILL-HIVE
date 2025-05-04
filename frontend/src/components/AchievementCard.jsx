import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Use axios directly instead of getUser
import { useUser } from '../contexts/UserContext';
import AchievementForm from './AchievementForm';

const AchievementCard = ({ achievement, onDelete, onUpdate, simplified = false }) => {
  const [authorName, setAuthorName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useUser();
  const isOwner = currentUser?.id === achievement.userId;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        // Direct axios call instead of using getUser
        const response = await axios.get(`http://localhost:8081/api/users/${achievement.userId}`);
        const userData = response.data;
        setAuthorName(userData.fullName || userData.username);
      } catch (error) {
        console.error('Error fetching achievement author:', error);
      }
    };
    
    if (achievement.userId) {
      fetchAuthor();
    }
  }, [achievement.userId]);

  const handleDelete = async () => {
    if (!isOwner || !currentUser) return;

    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8081/api/achievements/${achievement.id}?userId=${currentUser.id}`);
      if (onDelete) {
        onDelete(achievement.id);
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleUpdate = (updatedAchievement) => {
    if (onUpdate) {
      onUpdate(updatedAchievement);
    }
    setIsEditing(false);
  };

  const getVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Render the achievement content based on the template
  const renderAchievementContent = () => {
    switch(achievement.template) {
      case 2:
        return (
          <div className="rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex">
                {achievement.imageUrl && (
                  <img 
                    src={`http://localhost:8081${achievement.imageUrl}`}
                    alt="Achievement"
                    className="w-24 h-24 rounded-full object-cover mr-6"
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-xl text-black">{achievement.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Achieved by {authorName} • {new Date(achievement.createdAt).toLocaleDateString()}
                  </p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {achievement.category}
                  </span>
                  <p className="text-black mt-4 whitespace-pre-wrap">{achievement.description}</p>
                </div>
              </div>
              {achievement.videoUrl && getVideoId(achievement.videoUrl) && (
                <div className="aspect-w-16 aspect-h-9 mt-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${getVideoId(achievement.videoUrl)}`}
                    className="w-full h-64 rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="rounded-lg overflow-hidden">
            {achievement.imageUrl && (
              <div 
                className="w-full h-48 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url(http://localhost:8081${achievement.imageUrl})` 
                }}
              ></div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full mb-2">
                    {achievement.category}
                  </span>
                  <h3 className="font-bold text-xl text-black">{achievement.title}</h3>
                  <p className="text-sm text-gray-500">
                    Achieved by {authorName} • {new Date(achievement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-black mt-4 whitespace-pre-wrap border-t pt-4">{achievement.description}</p>
              {achievement.videoUrl && getVideoId(achievement.videoUrl) && (
                <div className="aspect-w-16 aspect-h-9 mt-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${getVideoId(achievement.videoUrl)}`}
                    className="w-full h-64 rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        );
      
      default: // Template 1 or default
        return (
          <div>
            <div className="flex justify-between mb-3">
              <div>
                <h3 className="font-medium text-xl text-black">{achievement.title}</h3>
                <p className="text-sm text-gray-500">
                  Achieved by {authorName} • {new Date(achievement.createdAt).toLocaleDateString()}
                </p>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded mt-1">
                  {achievement.category}
                </span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              {achievement.imageUrl && (
                <img
                  src={`http://localhost:8081${achievement.imageUrl}`}
                  alt="Achievement"
                  className="w-full h-auto rounded-lg mb-4 max-h-96 object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <p className="text-black whitespace-pre-wrap">{achievement.description}</p>
              {achievement.videoUrl && getVideoId(achievement.videoUrl) && (
                <div className="aspect-w-16 aspect-h-9 mb-4 mt-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${getVideoId(achievement.videoUrl)}`}
                    className="w-full h-64 rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {isEditing ? (
        <AchievementForm
          initialData={achievement}
          isEditing={true}
          onAchievementCreated={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex justify-between mb-3">
            {!simplified && isOwner && (
              <div className="flex space-x-2 ml-auto mb-2">
                <span
                  onClick={() => setIsEditing(true)}
                  className="bg-green-100 text-green-500 hover:bg-green-200 p-2 rounded-full cursor-pointer"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </span>
                <span
                  onClick={handleDelete}
                  className="bg-red-100 text-red-500 hover:bg-red-200 p-2 rounded-full cursor-pointer"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            )}
          </div>
          {renderAchievementContent()}
        </>
      )}
      
      {/* Confirm modal */}
      {showConfirmModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-full mx-auto">
            <h2 className="text-lg font-bold mb-4 text-center">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete this achievement? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <span
                onClick={() => setShowConfirmModal(false)}
                className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </span>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementCard;

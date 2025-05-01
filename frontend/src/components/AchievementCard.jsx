import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../services/api';
import { useUser } from '../contexts/UserContext';
import AchievementForm from './AchievementForm';
import axios from 'axios';

const AchievementCard = ({ achievement, onDelete, onUpdate, simplified = false }) => {
  const [authorName, setAuthorName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useUser();
  const isOwner = currentUser?.id === achievement.userId;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUser(achievement.userId);
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
                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 cursor-pointer"
                    title="Edit"
                  >
                    <span className="material-icons">edit</span>
                  </span>
                  <span
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    title="Delete"
                  >
                    <span className="material-icons">delete</span>
                  </span>
              </div>
            )}
          </div>
          {renderAchievementContent()}
         
        </>
      )}
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

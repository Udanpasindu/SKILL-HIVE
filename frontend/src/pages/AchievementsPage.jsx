import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { currentUser } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      fetchAchievements();
      fetchCategories();
    }
  }, [currentUser, selectedCategory]);
  
  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const endpoint = selectedCategory === 'all'
        ? `http://localhost:8081/api/users/${currentUser.id}/achievements`
        : `http://localhost:8081/api/users/${currentUser.id}/achievements/category/${selectedCategory}`;
      
      const response = await axios.get(endpoint);
      setAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/users/${currentUser.id}/achievements/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching achievement categories:', error);
    }
  };
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleCreateAchievement = () => {
    navigate('/achievements/create');
  };
  
  const handleEditAchievement = (achievementId) => {
    navigate(`/achievements/edit/${achievementId}`);
  };
  
  const handleDeleteAchievement = async (achievementId) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:8081/api/achievements/${achievementId}?userId=${currentUser.id}`);
      // Remove achievement from state
      setAchievements(achievements.filter(a => a.id !== achievementId));
    } catch (error) {
      console.error('Error deleting achievement:', error);
      alert('Failed to delete achievement. Please try again.');
    }
  };
  
  const getTemplateClass = (template) => {
    switch (template) {
      case 1:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 2:
        return 'bg-gradient-to-r from-green-500 to-teal-600';
      case 3:
        return 'bg-gradient-to-r from-purple-500 to-pink-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    }
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">My Achievements</h1>
                <p className="text-indigo-100">Track your progress and skills</p>
              </div>
              <button
                onClick={handleCreateAchievement}
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Create Achievement
              </button>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Achievements List */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : achievements.length === 0 ? (
              <div className="py-32 text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-lg">No achievements found in {selectedCategory === 'all' ? 'any category' : `the "${selectedCategory}" category`}</p>
                <p className="mt-2">Complete tasks to earn achievements!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="flex flex-col h-full rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                    <div className={`${getTemplateClass(achievement.template)} px-6 py-4 text-white`}>
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">{achievement.title}</h3>
                        {currentUser && currentUser.id === achievement.userId && (
                          <div className="flex space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAchievement(achievement.id);
                              }}
                              className="text-white hover:text-indigo-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAchievement(achievement.id);
                              }}
                              className="text-white hover:text-red-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-white/80">{achievement.category}</div>
                    </div>
                    
                    <div className="flex-grow p-6 bg-white dark:bg-gray-800">
                      <p className="text-gray-700 dark:text-gray-300">{achievement.description}</p>
                      
                      {achievement.imageId && (
                        <div className="mt-4">
                          <img 
                            src={`http://localhost:8081/api/achievements/image/${achievement.imageId}`}
                            alt={achievement.title}
                            className="w-full h-48 object-cover rounded-md"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        Earned on {new Date(achievement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;

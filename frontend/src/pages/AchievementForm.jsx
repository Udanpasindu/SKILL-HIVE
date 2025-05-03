import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';

const AchievementForm = () => {
  const { achievementId } = useParams();
  const isEditing = !!achievementId;
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    template: 1
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [currentImageId, setCurrentImageId] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchAchievement();
    }
  }, [achievementId]);

  // Preview the selected image
  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewImage(objectUrl);

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const fetchAchievement = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8081/api/achievements/${achievementId}`);
      
      // Check if the current user is the owner of this achievement
      if (response.data.userId !== currentUser?.id) {
        setError("You don't have permission to edit this achievement");
        return;
      }
      
      // Populate the form
      setFormData({
        title: response.data.title || '',
        description: response.data.description || '',
        category: response.data.category || '',
        template: response.data.template || 1
      });

      // Store the current imageId
      if (response.data.imageId) {
        setCurrentImageId(response.data.imageId);
        // Set preview image
        setPreviewImage(`http://localhost:8081/api/achievements/image/${response.data.imageId}`);
      }
    } catch (error) {
      console.error('Error fetching achievement:', error);
      setError('Failed to load achievement details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleTemplateSelect = (templateId) => {
    setFormData(prev => ({
      ...prev,
      template: templateId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create achievements');
      return;
    }
    
    // Form validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      setError('Please fill in all required fields: title, description, and category');
      return;
    }
    
    // In edit mode, we don't require a new image if one already exists
    if (!isEditing && !selectedFile && !currentImageId) {
      setError('Please select an image');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create FormData object for file upload
      const submissionData = new FormData();
      submissionData.append('title', formData.title);
      submissionData.append('description', formData.description);
      submissionData.append('category', formData.category);
      submissionData.append('template', formData.template);
      submissionData.append('userId', currentUser.id);
      
      // Only append file if it's selected (for new images or changing existing ones)
      if (selectedFile) {
        submissionData.append('image', selectedFile);
      }
      
      if (isEditing) {
        // Update existing achievement
        // Using the api directly with userId as a query parameter
        const url = `http://localhost:8081/api/achievements/${achievementId}`;
        console.log(`Sending PUT request to: ${url} with userId=${currentUser.id}`);
        
        // Important: Notice we're appending userId to the FormData instead of using params
        // This matches the controller's expectation to receive userId as a form parameter
        // submissionData.append('userId', currentUser.id); // This is already done above
        
        const response = await axios({
          method: 'put',
          url: url,
          data: submissionData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Update response:', response);
      } else {
        // Create new achievement
        await axios.post('http://localhost:8081/api/achievements', submissionData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      // Redirect back to achievements page
      navigate('/achievements');
    } catch (error) {
      console.error('Error saving achievement:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setError(error.response?.data?.message || 'Failed to save achievement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get color class for template preview
  const getTemplateClass = (templateId) => {
    switch (parseInt(templateId)) {
      case 1: return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 2: return 'bg-gradient-to-r from-green-500 to-teal-600';
      case 3: return 'bg-gradient-to-r from-purple-500 to-pink-600';
      default: return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold">{isEditing ? 'Edit Achievement' : 'Create Achievement'}</h1>
            <p className="text-indigo-100">Share your accomplishments and skills</p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Achievement Title"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Describe your achievement"
                  required
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Programming, Design, Music"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="image" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Upload Image {!isEditing && !currentImageId && <span className="text-red-500">*</span>}
                  {isEditing && currentImageId && <span className="text-sm text-gray-500"> (Leave empty to keep current image)</span>}
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required={!isEditing && !currentImageId}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Max file size: 5MB. Accepted formats: JPG, PNG, GIF
                </p>
                {previewImage && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="h-40 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="mb-10">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Template Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map(templateId => (
                    <div 
                      key={templateId}
                      className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all transform hover:scale-105 ${
                        parseInt(formData.template) === templateId ? 'border-indigo-500 scale-105' : 'border-transparent'
                      }`}
                      onClick={() => handleTemplateSelect(templateId)}
                    >
                      <div className={`${getTemplateClass(templateId)} h-24 flex items-center justify-center`}>
                        <span className="text-white font-bold">Template {templateId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/achievements')}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    <span>{isEditing ? 'Update Achievement' : 'Create Achievement'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementForm;

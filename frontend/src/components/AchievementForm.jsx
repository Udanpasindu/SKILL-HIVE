import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const AchievementForm = ({ onAchievementCreated, initialData, isEditing, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl ? 
    `http://localhost:8081${initialData.imageUrl}` : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(!!isEditing);
  const [category, setCategory] = useState(initialData?.category || '');
  const [selectedTemplate, setSelectedTemplate] = useState(initialData?.template || 1);
  
  const categories = ['Technical', 'Professional', 'Academic', 'Personal', 'Other'];
  
  const { currentUser } = useUser();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('skillshare_token');
      let achievement = {
        userId: currentUser.id,
        title,
        description,
        videoUrl,
        category,
        template: selectedTemplate,
        imageUrl: initialData?.imageUrl // Preserve existing imageUrl
      };

      // Default headers configuration
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Add auth token if available
      if (token) {
        config.headers['Authorization'] = token;
      }

      let response;
      
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await axios.post(
          'http://localhost:8081/api/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': token ? `Bearer ${token}` : ''
            }
          }
        );

        if (uploadResponse.data?.url) {
          achievement.imageUrl = uploadResponse.data.url;
        } else {
          throw new Error('Invalid upload response');
        }
      }

      if (isEditing) {
        response = await axios.put(
          `http://localhost:8081/api/achievements/${initialData.id}?userId=${currentUser.id}`,
          achievement,
          config
        );
      } else {
        response = await axios.post('http://localhost:8081/api/achievements', achievement, config);
      }

      if (response.data && onAchievementCreated) {
        onAchievementCreated(response.data);
        if (!isEditing) {
          setTitle('');
          setDescription('');
          setVideoUrl('');
          setImage(null);
          setImagePreview('');
          setSelectedTemplate(1);
          setShowForm(false);
        } else if (onCancel) {
          onCancel();
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Please log in to share achievements');
      } else {
        setError(error.response?.data?.message || 'Failed to save achievement');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm && !isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
        >
          Share New Achievement
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left: Form Section */}
      <div className="flex-1 bg-white p-4 rounded-lg shadow-md mb-4 md:mr-4">
        <h2 className="text-lg font-medium mb-4">
          {isEditing ? 'Edit Achievement' : 'Share New Achievement'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="4"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 max-h-48 rounded-md"
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL (optional)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Template Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((template) => (
                <div 
                  key={template}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate === template 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:border-indigo-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Template {template}</span>
                    <input 
                      type="radio" 
                      name="template" 
                      checked={selectedTemplate === template} 
                      onChange={() => setSelectedTemplate(template)} 
                    />
                  </div>
                  <div className="h-24 bg-gray-100 flex items-center justify-center rounded">
                    <span className="text-gray-500">Preview {template}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <span
              onClick={onCancel || (() => setShowForm(false))}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Share Achievement')}
            </button>
          </div>
        </form>
      </div>

      {/* Right: Template Preview Section */}
      <div className="md:w-1/3">
        <h3 className="text-lg font-medium mb-4">Template Preview</h3>
        <div className="space-y-4">
          {/* Template Preview 1 */}
          <div className={`p-4 border rounded-lg shadow-sm ${selectedTemplate === 1 ? 'border-indigo-500' : 'bg-gray-50'}`}>
            <h4 className="font-semibold text-gray-800">{title || 'Achievement Title'}</h4>
            <div className="my-2">
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-28 object-cover rounded-md" />}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{description || 'Achievement description will appear here'}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">{category || 'Category'}</p>
          </div>
          
          {/* Template Preview 2 */}
          <div className={`p-4 border rounded-lg shadow-sm ${selectedTemplate === 2 ? 'border-indigo-500' : 'bg-gray-50'}`}>
            <div className="flex">
              {imagePreview && 
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover mr-4" />
              }
              <div>
                <h4 className="font-semibold text-gray-800">{title || 'Achievement Title'}</h4>
                <p className="text-xs text-gray-500">{category || 'Category'}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{description || 'Achievement description will appear here'}</p>
              </div>
            </div>
            {videoUrl && getVideoId(videoUrl) && (
              <div className="mt-2 border-t pt-2">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded">
                  <span className="text-xs text-gray-500">Video preview</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Template Preview 3 */}
          <div className={`rounded-lg shadow-sm overflow-hidden ${selectedTemplate === 3 ? 'border-2 border-indigo-500' : 'border'}`}>
            {imagePreview ? (
              <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${imagePreview})` }}></div>
            ) : (
              <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            )}
            <div className="p-4">
              <h4 className="font-bold text-gray-800">{title || 'Achievement Title'}</h4>
              <div className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600 mt-2">{category || 'Category'}</div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description || 'Achievement description will appear here'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementForm;

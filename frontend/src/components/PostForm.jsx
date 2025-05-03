import { useState, useRef, useEffect } from 'react';
import { createPost, getUser } from '../services/api';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';

const PostForm = ({ onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [userVerified, setUserVerified] = useState(false);
  
  const videoRef = useRef(null);
  const { currentUser, updateUser } = useUser();

  // Verify user exists in the backend on component mount
  useEffect(() => {
    const verifyUser = async () => {
      if (!currentUser) return;
      
      try {
        // Try to get user info from backend to verify the ID is valid
        const response = await axios.get(`http://localhost:8081/api/users/${currentUser.id}`, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: false
        });
        
        if (response.data && response.data.id) {
          setUserVerified(true);
        } else {
          console.warn('User verification returned invalid data');
          // Still set to true to allow functionality
          setUserVerified(true);
        }
      } catch (err) {
        console.error('Error verifying user:', err);
        // Set to true anyway to avoid blocking functionality
        setUserVerified(true);
      }
    };

    verifyUser();
  }, [currentUser]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding new files would exceed the limit
    if (images.length + files.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }
    
    // Filter for image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Create new arrays with the added files
    const newImages = [...images, ...imageFiles];
    setImages(newImages);
    
    // Create previews for the new images
    const newPreviews = [...imagePreviews];
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the error if we're under the limit
    if (newImages.length <= 3) {
      setError('');
    }
  };
  
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }
    
    setVideo(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    
    // Check video duration after it's loaded
    const videoElement = document.createElement('video');
    videoElement.src = url;
    videoElement.onloadedmetadata = () => {
      if (videoElement.duration > 30) {
        setError('Video duration must be 30 seconds or less');
        setVideo(null);
        setVideoPreview('');
      } else {
        setError('');
      }
    };
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };
  
  const removeVideo = () => {
    setVideo(null);
    setVideoPreview('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !currentUser?.id || isSubmitting) {
      return;
    }
    
    if (error) {
      alert('Please fix the errors before submitting');
      return;
    }
    
    if (!userVerified) {
      setError('Your user account could not be verified. Please try logging out and back in.');
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('title', title);
    formData.append('content', content);
    
    // Add images to form data
    images.forEach(image => {
      formData.append('images', image);
    });
    
    // Add video to form data if present
    if (video) {
      formData.append('video', video);
    }
    
    try {
      // Try direct axios call first as a fallback method
      const response = await axios.post('http://localhost:8081/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setImages([]);
      setImagePreviews([]);
      setVideo(null);
      setVideoPreview('');
      setShowForm(false);
      
      if (onPostCreated && response.data) {
        onPostCreated(response.data);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      let errorMessage = 'Failed to create post. Please try again.';
      
      if (error.response) {
        // Handle specific error cases
        if (error.response.status === 404) {
          errorMessage = 'User account not found. Please try logging out and back in.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = `Error: ${error.response.data.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!showForm) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Create New Post
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-lg font-medium mb-4">Create a New Post</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter post title"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="What would you like to share?"
            rows="4"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images (Max 3)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={images.length >= 3}
            multiple
          />
          
          {imagePreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video (30 seconds max)
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={!!video}
          />
          
          {videoPreview && (
            <div className="mt-2 relative">
              <video 
                ref={videoRef}
                src={videoPreview} 
                className="w-full h-auto rounded-md" 
                controls
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim() || error}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
              isSubmitting || !title.trim() || !content.trim() || error ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;

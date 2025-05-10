/**
 * Utility functions for handling images
 */

/**
 * Format an image URL to ensure it has the proper base URL prefix
 * 
 * @param {string} imageUrl - The image URL from the server
 * @param {string} baseUrl - The backend base URL (defaults to localhost:8081)
 * @returns {string} - The formatted URL
 */
export const formatImageUrl = (imageUrl, baseUrl = 'http://localhost:8081') => {
  if (!imageUrl) {
    return 'https://via.placeholder.com/800x400?text=Image+Not+Available';
  }
  
  // Check if the URL is already absolute
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Ensure URL starts with a slash
  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  // Combine base URL with image path
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Preload an image to verify it loads correctly
 * 
 * @param {string} url - The image URL to preload
 * @returns {Promise} - A promise that resolves when the image is loaded, or rejects on error
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

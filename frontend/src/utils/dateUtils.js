/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  // Get time difference in seconds
  const secondsAgo = Math.floor((new Date() - date) / 1000);
  
  // Less than a minute
  if (secondsAgo < 60) {
    return 'Just now';
  }
  
  // Less than an hour
  if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Format the date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a date relative to the current time
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return formatDate(dateString);
};

/**
 * Parse a potentially problematic date string into a valid Date object
 * 
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} - Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Try ISO format first
    const date = new Date(dateString);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
    
    // Try with additional parsing if needed
    // MongoDB dates sometimes come as "/Date(1234567890000)/" format
    const mongoMatch = /\/Date\((\d+)\)\//.exec(dateString);
    if (mongoMatch) {
      const timestamp = parseInt(mongoMatch[1], 10);
      const date = new Date(timestamp);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  } catch (e) {
    console.error("Error parsing date:", e, dateString);
    return null;
  }
};

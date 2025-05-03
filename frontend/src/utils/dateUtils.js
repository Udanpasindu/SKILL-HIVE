/**
 * Format a date string or object into a user-friendly format
 * 
 * @param {string|Date|Object|Array} dateInput - Date string, Date object, array, or date-like object
 * @param {boolean} includeTime - Whether to include time in the output
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, includeTime = true) => {
  // Return early for null or undefined
  if (dateInput == null) return 'Unknown date';
  
  try {
    // For debugging
    console.log("Date input type:", typeof dateInput, dateInput);
    
    // Handle various date formats
    let timestamp;
    
    // Case 1: Date is an array [year, month, day, hour, minute, second, nanoseconds]
    // This is how Java's LocalDateTime is serialized
    if (Array.isArray(dateInput)) {
      // Convert array to Date object - months are 0-indexed in JS but 1-indexed in Java
      const [year, month, day, hour, minute, second, nano] = dateInput;
      const date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
      timestamp = date.getTime();
    }
    // Case 2: Already a Date object
    else if (dateInput instanceof Date) {
      timestamp = dateInput.getTime();
    }
    // Case 3: ISO string or other date string
    else if (typeof dateInput === 'string') {
      timestamp = Date.parse(dateInput);
    }
    // Case 4: MongoDB format with $date field
    else if (typeof dateInput === 'object' && dateInput.$date) {
      if (typeof dateInput.$date === 'string') {
        timestamp = Date.parse(dateInput.$date);
      } else if (typeof dateInput.$date === 'number') {
        timestamp = dateInput.$date;
      }
    }
    // Case 5: MongoDB format with seconds and nanoseconds
    else if (typeof dateInput === 'object' && 
             dateInput.hasOwnProperty('$numberLong') || 
             (dateInput.hasOwnProperty('t') && dateInput.hasOwnProperty('i'))) {
      // Handle BSON format
      timestamp = parseInt(dateInput.$numberLong || dateInput.t, 10);
    }
    // Case 6: Timestamp as number
    else if (typeof dateInput === 'number') {
      timestamp = dateInput;
    }
    // Case 7: Object with timestamp-like property
    else if (typeof dateInput === 'object') {
      // Try common timestamp properties
      for (const prop of ['timestamp', 'time', 'date', 'createdAt', '_date']) {
        if (dateInput[prop]) {
          if (typeof dateInput[prop] === 'number') {
            timestamp = dateInput[prop];
            break;
          } else if (typeof dateInput[prop] === 'string') {
            timestamp = Date.parse(dateInput[prop]);
            break;
          } else if (dateInput[prop] instanceof Date) {
            timestamp = dateInput[prop].getTime();
            break;
          }
        }
      }
    }

    // If we still don't have a valid timestamp, try direct string conversion as last resort
    if (!timestamp || isNaN(timestamp)) {
      console.warn("Failed to parse date normally, trying string conversion:", dateInput);
      const fallbackDate = new Date(String(dateInput));
      timestamp = fallbackDate.getTime();
    }
    
    // Final check if we have a valid timestamp
    if (!timestamp || isNaN(timestamp)) {
      console.error("Could not parse date from input:", dateInput);
      return 'Invalid date';
    }
    
    // Create date from timestamp
    const date = new Date(timestamp);
    
    // Format the date
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error, "Input was:", dateInput);
    return 'Date formatting error';
  }
};

/**
 * Format a date as a relative time (e.g., "5 minutes ago")
 * 
 * @param {string|Date|Object|Array} dateInput - Date string, Date object, array, or date-like object
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateInput) => {
  if (dateInput == null) return '';
  
  try {
    // Try to get a timestamp using the same logic as formatDate
    let timestamp;
    
    // Handle array format [year, month, day, hour, minute, second, nanoseconds]
    if (Array.isArray(dateInput)) {
      const [year, month, day, hour, minute, second] = dateInput;
      const date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
      timestamp = date.getTime();
    }
    // Use similar logic to formatDate to get a timestamp for other formats
    else if (dateInput instanceof Date) {
      timestamp = dateInput.getTime();
    } else if (typeof dateInput === 'string') {
      timestamp = Date.parse(dateInput);
    } else if (typeof dateInput === 'object' && dateInput.$date) {
      if (typeof dateInput.$date === 'string') {
        timestamp = Date.parse(dateInput.$date);
      } else if (typeof dateInput.$date === 'number') {
        timestamp = dateInput.$date;
      }
    } else if (typeof dateInput === 'number') {
      timestamp = dateInput;
    }
    
    if (!timestamp || isNaN(timestamp)) {
      return formatDate(dateInput, false); // Fall back to formatDate
    }
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    
    // Handle future dates
    if (diffMs < 0) return 'in the future';
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return `${diffSecs} sec ago`;
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    // For older dates, show the actual date
    return formatDate(date, false);
  } catch (error) {
    console.error("Error calculating relative time:", error, "Input was:", dateInput);
    return '';
  }
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

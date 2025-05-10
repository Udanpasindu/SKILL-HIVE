import React from 'react';

/**
 * Parse text and convert @mentions into styled spans
 * 
 * @param {string} text - The text to parse for @mentions
 * @returns {Array} - Array of JSX elements with styled mentions
 */
export const parseMentions = (text) => {
  if (!text) return '';
  
  // Regex to match @username (alphanumeric + dots)
  const mentionRegex = /@([\w.]+)/g;
  const parts = [];
  
  let lastIndex = 0;
  let match;
  
  // Find all mentions and split text into parts
  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the styled mention with dark theme animation
    parts.push(
      <span 
        key={match.index} 
        className="inline-block text-white font-medium bg-gray-800 dark:bg-gray-700 rounded px-1 py-0.5 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
      >
        @{match[1]}
      </span>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text after the last mention
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts;
};






































import { useState, useRef, useEffect } from 'react';
import { searchUsers } from '../services/api';

const MentionInput = ({ value, onChange, placeholder, disabled }) => {
  const [mentionSearch, setMentionSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Check for @ mentions when typing
  useEffect(() => {
    const checkForMention = async () => {
      if (!mentionSearch.trim()) {
        setShowSuggestions(false);
        return;
      }

      try {
        const users = await searchUsers(mentionSearch);
        setSuggestions(users);
        setShowSuggestions(users.length > 0);
      } catch (error) {
        console.error('Error searching for users:', error);
        setShowSuggestions(false);
      }
    };

    if (mentionSearch) {
      checkForMention();
    }
  }, [mentionSearch]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    onChange(newValue);

    // Check for mention pattern
    const textUntilCursor = newValue.substring(0, cursorPos);
    const atIndex = textUntilCursor.lastIndexOf('@');
    
    if (atIndex !== -1 && (atIndex === 0 || textUntilCursor[atIndex - 1] === ' ')) {
      // Extract query after @
      const query = textUntilCursor.substring(atIndex + 1);
      if (query.length > 0 && !query.includes(' ')) {
        setMentionSearch(query);
      } else {
        setShowSuggestions(false);
        setMentionSearch('');
      }
    } else {
      setShowSuggestions(false);
      setMentionSearch('');
    }
  };

  const insertMention = (username) => {
    if (textareaRef.current) {
      const textBeforeCursor = value.substring(0, cursorPosition);
      const lastAtPos = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtPos !== -1) {
        const textBeforeMention = value.substring(0, lastAtPos + 1); // Keep the @
        const textAfterCursor = value.substring(cursorPosition);
        
        const newValue = textBeforeMention + username + ' ' + textAfterCursor;
        onChange(newValue);
        
        const newCursorPos = lastAtPos + username.length + 2; // +2 for @ and space
        
        // Set cursor position after inserting mention
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = newCursorPos;
            textareaRef.current.selectionEnd = newCursorPos;
            textareaRef.current.focus();
          }
        }, 0);
      }
    }
    
    setShowSuggestions(false);
    setMentionSearch('');
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        rows={2}
        disabled={disabled}
      />
      
      {showSuggestions && (
        <div 
          ref={suggestionsRef} 
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            suggestions.map(user => (
              <div
                key={user.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => insertMention(user.username)}
              >
                <div className="font-medium">{user.username}</div>
                {user.fullName && <div className="text-xs text-gray-500">{user.fullName}</div>}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentionInput;

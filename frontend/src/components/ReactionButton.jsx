import React, { useState, useEffect, useRef } from 'react';
import { addReaction, removeReaction, getReactions } from '../services/api';
import ReactionSelector from './ReactionSelector';

const reactionEmojis = {
  'LIKE': '👍',
  'LOVE': '❤️',
  'HAHA': '😂',
  'WOW': '😮',
  'SAD': '😢',
  'ANGRY': '😠'
};

const reactionLabels = {
  'LIKE': 'Like',
  'LOVE': 'Love',
  'HAHA': 'Haha',
  'WOW': 'Wow',
  'SAD': 'Sad',
  'ANGRY': 'Angry'
};

const ReactionButton = ({ postId, userId, onReactionsUpdate }) => {
  const [userReaction, setUserReaction] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchReactions = async () => {
      if (!userId || !postId) return;
      
      try {
        const data = await getReactions(postId, userId);
        if (data.userReaction) {
          setUserReaction(data.userReaction.type);
        }
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };
    
    fetchReactions();
  }, [postId, userId]);
  
  useEffect(() => {
    // Add click outside handler to close selector
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowSelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowSelector(true), 500);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowSelector(false), 500);
  };

  const handleSelectReaction = async (type) => {
    if (!userId || loading) return;
    
    setLoading(true);
    try {
      if (userReaction === type) {
        // If clicking the same reaction, remove it
        await removeReaction(postId, userId, type);
        setUserReaction(null);
      } else {
        // Add or change reaction
        const result = await addReaction(postId, userId, type);
        setUserReaction(type);
        if (onReactionsUpdate) {
          onReactionsUpdate(result);
        }
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    } finally {
      setLoading(false);
      setShowSelector(false);
    }
  };
  
  const handleClick = () => {
    if (!userId || loading) return;
    
    if (userReaction) {
      // Toggle existing reaction
      handleSelectReaction(userReaction);
    } else {
      // Default to LIKE on direct click
      handleSelectReaction('LIKE');
    }
  };

  const getButtonLabel = () => {
    if (!userReaction) return 'Like';
    return reactionLabels[userReaction] || 'Like';
  };

  const getButtonEmoji = () => {
    if (!userReaction) return '';
    return reactionEmojis[userReaction];
  };

  return (
    <div className="relative" ref={buttonRef}>
      <ReactionSelector 
        onSelectReaction={handleSelectReaction} 
        visible={showSelector}
        onOutsideClick={() => setShowSelector(false)}
      />
      
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={loading || !userId}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          userReaction 
            ? 'text-blue-600 hover:text-blue-800' 
            : 'text-gray-600 hover:text-blue-600'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {getButtonEmoji()} <span>{getButtonLabel()}</span>
      </button>
    </div>
  );
};

export default ReactionButton;

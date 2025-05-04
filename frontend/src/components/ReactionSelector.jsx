import React, { useState } from 'react';


const reactionTypes = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
  { type: 'HAHA', emoji: '😂', label: 'Haha' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'SAD', emoji: '😢', label: 'Sad' },
  { type: 'ANGRY', emoji: '😠', label: 'Angry' }
];

const ReactionSelector = ({ onSelectReaction, visible, onOutsideClick }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Keep the selector visible while hovering
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // Only hide if both the selector is no longer hovered AND the button is not pressed
  const shouldShow = visible || isHovering;
  
  if (!shouldShow) return null;

  return (
    <div 
      className="absolute bottom-full mb-2 bg-white rounded-full shadow-lg p-2 flex space-x-1 transform transition-transform duration-200 animate-rise"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {reactionTypes.map((reaction) => (
        <button
          key={reaction.type}
          className="reaction-button hover:scale-125 transition-transform p-1"
          onClick={() => onSelectReaction(reaction.type)}
          aria-label={reaction.label}
          title={reaction.label}
        >
          <span className="text-xl">{reaction.emoji}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionSelector;

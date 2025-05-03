import React from 'react';

const reactionEmojis = {
  'LIKE': '👍',
  'LOVE': '❤️',
  'HAHA': '😂',
  'WOW': '😮',
  'SAD': '😢',
  'ANGRY': '😠'
};

const ReactionDisplay = ({ reactionCounts }) => {
  if (!reactionCounts || Object.keys(reactionCounts).length === 0) {
    return null;
  }

  // Sort reactions by count (highest first)
  const sortedReactions = Object.entries(reactionCounts)
    .sort(([, countA], [, countB]) => countB - countA);

  // Take the top 3 reactions to display
  const topReactions = sortedReactions.slice(0, 3);
  const totalCount = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="reactions-bar" title={`${totalCount} reactions`}>
      <div className="flex -space-x-1">
        {topReactions.map(([type, count]) => (
          <span
            key={type}
            className="w-5 h-5 inline-block bg-white border border-gray-200 rounded-full text-xs flex items-center justify-center"
            title={`${count} ${type.toLowerCase()}`}
          >
            {reactionEmojis[type] || '👍'}
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-500 font-medium">{totalCount}</span>
    </div>
  );
};

export default ReactionDisplay;

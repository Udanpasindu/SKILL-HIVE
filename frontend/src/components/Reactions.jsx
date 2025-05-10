import React from 'react';
import ReactionButton from './ReactionButton';
import ReactionDisplay from './ReactionDisplay';

const Reactions = ({ reactionCounts, totalReactions, postId, onReactionsUpdate }) => {
  return (
    <div className="flex items-center justify-between">
      <ReactionDisplay reactionCounts={reactionCounts} />
      <ReactionButton 
        postId={postId} 
        userId={localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).id : null} 
        onReactionsUpdate={onReactionsUpdate} 
      />
    </div>
  );
};

export default Reactions;

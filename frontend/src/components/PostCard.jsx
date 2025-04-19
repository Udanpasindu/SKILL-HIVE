import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import useWebSocket from '../hooks/useWebSocket';
import { getUser } from '../services/api';

const PostCard = ({ post, userId, detailed = false }) => {
  const [authorName, setAuthorName] = useState('');
  const [showComments, setShowComments] = useState(detailed);
  
  // Use WebSocket for real-time updates
  const { likeCount: wsLikeCount, comments: wsComments, addLocalComment } = useWebSocket(post.id);
  
  // Local state for likes and comments
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);
  
  const commentListRef = useRef();
  
  // Update like count from WebSocket
  useEffect(() => {
    if (wsLikeCount > 0) {
      setLocalLikeCount(wsLikeCount);
    }
  }, [wsLikeCount]);
  
  // Fetch author name
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUser(post.userId);
        setAuthorName(userData.fullName || userData.username);
      } catch (error) {
        console.error('Error fetching post author:', error);
      }
    };
    
    if (post.userId) {
      fetchAuthor();
    }
  }, [post.userId]);
  
  // Handle new comment added
  const handleCommentAdded = (newComment) => {
    console.log('Comment added:', newComment);
    // Register this comment as locally added to prevent duplication from WebSocket
    if (newComment && newComment.id) {
      addLocalComment(newComment.id);
    }
    
    if (commentListRef && commentListRef.current) {
      commentListRef.current.addComment(newComment);
    }
  };
  
  // Toggle comments section
  const toggleComments = () => {
    if (!detailed) {
      setShowComments(prev => !prev);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {/* Post header */}
      <div className="flex justify-between mb-3">
        <div>
          <h3 className="font-medium">{post.title}</h3>
          <p className="text-sm text-gray-500">
            Posted by {authorName || 'Anonymous'} • 
            {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {/* Post content */}
      <div className="mb-4">
        <p className="text-gray-800">{post.content}</p>
      </div>
      
      {/* Post actions */}
      <div className="flex justify-between items-center border-t border-b py-2 my-2">
        <LikeButton
          postId={post.id}
          initialLikeCount={localLikeCount}
          userId={userId}
          onLikeUpdate={setLocalLikeCount}
        />
        
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-green-600 text-sm font-medium"
          >
            <span className="material-icons text-base">edit</span>
            Edit
          </button>
          
          <button
            className="inline-flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-red-600 text-sm font-medium"
          >
            <span className="material-icons text-base">delete</span>
            Delete
          </button>
          
          {!detailed && (
            <button
              onClick={toggleComments}
              className="inline-flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              <span className="material-icons text-base">comment</span>
              {showComments ? 'Hide Comments' : 'Show Comments'}
            </button>
          )}
          
          {!detailed && (
            <Link
              to={`/post/${post.id}`}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
      
      {/* Comments section */}
      {(showComments || detailed) && (
        <div className="mt-3 border-t pt-3">
          {/* Comment form */}
          <CommentForm 
            postId={post.id} 
            userId={userId} 
            onCommentAdded={handleCommentAdded}
          />
          
          {/* Comment list */}
          <CommentList 
            ref={commentListRef}
            postId={post.id} 
            userId={userId}
            postOwnerId={post.userId}
            initialComments={wsComments}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;

import { useState, useEffect } from 'react';
import { getUserPosts } from '../services/api';
import PostCard from './PostCard';

const UserPosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const userPosts = await getUserPosts(userId);
        setPosts(userPosts);
      } catch (err) {
        setError('Failed to load posts');
        console.error('Error fetching user posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (posts.length === 0) return <div>No posts yet</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          userId={userId}
        />
      ))}
    </div>
  );
};

export default UserPosts;

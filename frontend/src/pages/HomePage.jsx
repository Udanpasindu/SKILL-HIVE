import { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import { useUser } from '../contexts/UserContext';
import LoadingIndicator from '../components/LoadingIndicator';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser, loading: userLoading } = useUser();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8081/api/posts');
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  const handlePostCreated = (newPost) => {
    // Add the new post to the beginning of the list
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };
  
  if (userLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <LoadingIndicator message="Loading posts..." />
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Skillshare Feed</h1>
      
      {currentUser && <PostForm onPostCreated={handlePostCreated} />}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      <h2 className="text-xl font-medium mb-4">Recent Posts</h2>
      
      {posts.length === 0 ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600">No posts available. Be the first to create one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              userId={currentUser?.id} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;

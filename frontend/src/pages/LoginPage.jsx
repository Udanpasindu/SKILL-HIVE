import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (!username || !password) {
        throw new Error('Please enter both username and password');
      }
      
      console.log('Attempting login with credentials:', username);
      await login(username, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      
      // Show more detailed error messages
      if (error.message.includes('Invalid username/email or password')) {
        const enteredUsername = username.toLowerCase();
        
        // Check if it looks like a case sensitivity issue
        if (["testuser", "akila320", "yeharad"].some(user => 
            user.toLowerCase() === enteredUsername && user !== username)) {
          setError(`Username might be case-sensitive. Did you mean one of the test users?`);
        } else {
          setError('Invalid username/email or password. Please try the test credentials listed above.');
        }
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">Welcome Back</h2>
        
        {/* Test credentials banner */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
          <p className="font-medium">Test Credentials:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Username: <span className="font-mono">testuser</span>, Password: <span className="font-mono">password123</span></li>
            <li>Username: <span className="font-mono">akila320</span>, Password: <span className="font-mono">password123</span></li>
            <li>Username: <span className="font-mono">yeharad</span>, Password: <span className="font-mono">password123</span></li>
          </ul>
          <div className="mt-2 text-sm">
            <p><strong>Note:</strong> Usernames are case-sensitive. Use exactly as shown above.</p>
          </div>
        </div>
        
        {error && (
          <div className="whitespace-pre-line bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username or Email
            </label>
            <input
              className="appearance-none border-2 border-gray-200 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500"
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={handleChange}
              required
              placeholder="Enter your username or email"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="appearance-none border-2 border-gray-200 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <div className="flex flex-col space-y-4">
            <button
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
            
            <div className="text-center mt-4">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                Register now
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

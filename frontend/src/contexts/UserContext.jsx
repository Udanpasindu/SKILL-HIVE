import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create context
const UserContext = createContext();

// Create provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get from localStorage
        const savedUser = localStorage.getItem('skillshare_user');
        
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Function to register user
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8081/api/auth/register', userData);
      const user = response.data;
      setCurrentUser(user);
      localStorage.setItem('skillshare_user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };
  
  // Function to login user
  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', credentials);
      const user = response.data;
      setCurrentUser(user);
      localStorage.setItem('skillshare_user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid credentials'
      };
    }
  };

  // Function to update user
  const updateUser = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('skillshare_user', JSON.stringify(userData));
  };
  
  // Function to logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('skillshare_user');
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      loading, 
      register,
      login,
      updateUser, 
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Create custom hook for using user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

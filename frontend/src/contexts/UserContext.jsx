import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, verifySession, register as apiRegister } from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const isValid = await verifySession();
        if (!isValid) {
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        validateSession();
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiLogin({ username, password });
      
      if (!response || !response.id) {
        throw new Error('Invalid response from server');
      }
      
      // Properly store user data
      const userData = {
        id: response.id,
        username: response.username,
        email: response.email,
        fullName: response.fullName,
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData);
      
      if (!response || !response.id) {
        return { success: false, error: 'Invalid response from server' };
      }
      
      // Store user data
      const newUser = {
        id: response.id,
        username: response.username,
        email: response.email,
        fullName: response.fullName,
      };
      
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  // Show loading state while checking for saved user
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ currentUser, login, logout, updateUser, register }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/services/api';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    user: null,
    isLoggedIn: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthState({
          user: null,
          isLoggedIn: false,
          isLoading: false,
          error: null
        });
        return;
      }
      
      try {
        // Verify token with backend
        const response = await getCurrentUser();
        
        setAuthState({
          user: response.data,
          isLoggedIn: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        // If token is invalid, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        setAuthState({
          user: null,
          isLoggedIn: false,
          isLoading: false,
          error: 'Authentication failed'
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setAuthState({
      user: userData,
      isLoggedIn: true,
      isLoading: false,
      error: null
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null
    });
  };

  return {
    user: authState.user,
    isLoggedIn: authState.isLoggedIn,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout
  };
};

export default useAuth; 
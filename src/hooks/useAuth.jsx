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
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      const currentTime = Date.now();
      const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds

      if (token && loginTimestamp) {
        // Check if session has expired based on timestamp
        if (currentTime - parseInt(loginTimestamp, 10) > twoMinutes) {
          console.log('Session expired based on timestamp. Logging out.');
          // Session expired, clear all relevant localStorage items
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('loginTimestamp');
          setAuthState({
            user: null,
            isLoggedIn: false,
            isLoading: false,
            error: 'Session expired'
          });
          return;
        }
      }

      if (!token || !storedUser) {
        setAuthState({
          user: null,
          isLoggedIn: false,
          isLoading: false,
          error: null
        });
        return;
      }
      
      try {
        // If token and timestamp are valid, verify token with backend
        const response = await getCurrentUser();
        setAuthState({
          user: response.data,
          isLoggedIn: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.log('Token validation failed with backend. Logging out.', error);
        // If API call fails (e.g., token invalid for other reasons), clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTimestamp'); // Clear timestamp too
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authAPI from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            id: decoded.user_id,
            email: decoded.email,
            role: decoded.role,
            username: decoded.username,
          });
        } else {
          // Token expired, remove it
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { accessToken } = response;
      
      if (accessToken) {
      const decoded = jwtDecode(accessToken);
        localStorage.setItem('accessToken', accessToken);
      setToken(accessToken);
      setUser({
        id: decoded.user_id,
        email: decoded.email,
          role: decoded.role,
          username: decoded.username,
      });
        return { success: true };
      }
      throw new Error('No access token received');
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isWriter = () => {
    return user?.role === 'writer';
  };

  const getAuthToken = () => {
    return token;
  };

  const value = {
      user,
      token,
      loading,
      login,
      logout,
    isAuthenticated,
      isAdmin,
    isWriter,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


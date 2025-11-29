// AuthContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { getMyProfile } from "../api/ProfileApis";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      checkAuth();
      hasCheckedAuth.current = true;
    }
  }, []);

  const checkAuth = async () => {
    try {
      // ✅ FIXED: Use the same keys as Http.js
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await getMyProfile();
      if (response.status === 200) {
        setIsLoggedIn(true);
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUser(null);
      // ✅ FIXED: Clear with correct keys
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData, tokens) => {
    setIsLoggedIn(true);
    setUser(userData);
    
    if (tokens) {
      // ✅ FIXED: Use consistent keys
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
    }
  };

  const logout = () => {
    // ✅ FIXED: Use consistent keys
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUser(null);
  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check for token in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user with token
  const fetchCurrentUser = async (token) => {
    try {
      const response = await authService.getCurrentUser(token);
      setUser(response.data.user);
    } catch (error) {
      console.error('Fetch user failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const token = response.token;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  };

  // Register
  const register = async (name, email, mobile, password, role) => {
    try {
      const response = await authService.register(name, email, mobile, password, role);
      const token = response.token;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

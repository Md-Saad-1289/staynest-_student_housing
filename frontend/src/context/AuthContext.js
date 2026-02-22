import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data.data.user);
    } catch (error) {
      console.error('Fetch user failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      const payload = data.data || {};
      localStorage.setItem('token', payload.token);
      setToken(payload.token);
      setUser(payload.user);
      return data;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  };

  const register = async (name, email, phoneNo, password, role) => {
    try {
      const data = await authService.register(name, email, phoneNo, password, role);
      const payload = data.data || {};
      localStorage.setItem('token', payload.token);
      setToken(payload.token);
      setUser(payload.user);
      return data;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
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

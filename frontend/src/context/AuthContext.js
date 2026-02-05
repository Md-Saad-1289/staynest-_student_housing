import React, { createContext, useState, useEffect } from 'react';
import api, { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // axios response interceptor: auto logout on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('Token expired or invalid. Logging out...');
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // load token & user on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      if (!token) return;
      // token is already in localStorage, axios interceptor will attach it
      const res = await authService.getCurrentUser();
      setUser(res.data.user);
    } catch (error) {
      console.error('Fetching user failed:', error.response?.data || error.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, mobile, password, role) => {
    try {
      const res = await authService.register({ name, email, mobile, password, role });
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
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
        token,
        loading,
        isAuthenticated: !!token,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

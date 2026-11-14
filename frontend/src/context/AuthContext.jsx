import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mentormind_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('mentormind_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await authAPI.getMe();
      if (res.data && res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('mentormind_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Session load failed:', err.message);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('mentormind_token');
      localStorage.removeItem('mentormind_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data && res.data.success) {
      localStorage.setItem('mentormind_token', res.data.token);
      localStorage.setItem('mentormind_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setProfile(res.data.profile);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    if (res.data && res.data.success) {
      localStorage.setItem('mentormind_token', res.data.token);
      localStorage.setItem('mentormind_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setProfile(res.data.profile);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('mentormind_token');
    localStorage.removeItem('mentormind_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await profileAPI.getProfile();
      if (res.data && res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (e) {
      console.warn('Profile refresh error:', e.message);
    }
  };

  const value = {
    user,
    profile,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshProfile,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

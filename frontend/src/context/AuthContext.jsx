import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getUserProfile, logoutUser } from '../services/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on app mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await getUserProfile();
          if (res.success) {
            setUser(res.user);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Failed to load user profile on mount:', err.message);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(email, password);
      if (res.success) {
        const { token, user: userData } = res;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return userData;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const handleRegister = async (fullName, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(fullName, email, password);
      if (res.success) {
        // Automatically attempt login after registration or instruct login
        setLoading(false);
        return res;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Backend logout call skipped or failed:', err.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

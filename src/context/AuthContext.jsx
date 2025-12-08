import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.checkAuth();
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnonymous = async () => {
    try {
      const response = await authAPI.generateAnonymous();
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: 'Failed to generate user' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error occurred' };
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (username, password, mobileNumber, captchaToken) => {
    try {
      const response = await authAPI.signup(username, password, mobileNumber, captchaToken);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed',
        errors: error.response?.data?.errors 
      };
    }
  };

  const getRecaptchaKey = async () => {
    try {
      const response = await authAPI.getRecaptchaKey();
      return response.data;
    } catch (error) {
      return { site_key: '', enabled: false };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Logout failed' };
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: 'Update failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  const value = {
    user,
    loading,
    generateAnonymous,
    login,
    signup,
    getRecaptchaKey,
    logout,
    updateProfile,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Synchronously initialize user state from localStorage to prevent flash of login screen and redirects
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const roomNumber = localStorage.getItem('roomNumber');
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('userId');
    if (token && name && role) {
      return { id, name, roomNumber, role };
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    return !(token && name && role);
  });

  // Verify and update user from localStorage token on initial load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getMe();
          // Update profile in localStorage and state to keep it in sync
          localStorage.setItem('name', profile.name);
          localStorage.setItem('roomNumber', profile.roomNumber);
          localStorage.setItem('role', profile.role);
          localStorage.setItem('userId', profile.id);
          
          setUser({
            id: profile.id,
            name: profile.name,
            roomNumber: profile.roomNumber,
            role: profile.role
          });
        } catch (error) {
          console.error('[AUTH] Failed to fetch current user profile:', error);
          // Token might be expired or invalid, clear localStorage ONLY if server responds with 401/403.
          // Network errors or temporary server down should not log the user out.
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('name');
            localStorage.removeItem('roomNumber');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (name, roomNumber, accessCode) => {
    try {
      const data = await authService.login(name, roomNumber, accessCode);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.user.name);
      localStorage.setItem('roomNumber', data.user.roomNumber);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userId', data.user.id);

      setUser(data.user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 
                     (error.request ? 'Database or server is offline. Please check if MongoDB is running.' : 'Login failed');
      return { success: false, message };
    }
  };

  const adminLogin = async (name, accessCode) => {
    try {
      const data = await authService.adminLogin(name, accessCode);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('name', data.user.name);
      localStorage.setItem('userId', data.user.id);

      setUser(data.user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 
                     (error.request ? 'Database or server is offline. Please check if MongoDB is running.' : 'Admin login failed');
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('roomNumber');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    adminLogin,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

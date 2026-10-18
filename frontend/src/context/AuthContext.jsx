import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('bizconnect_user');
    const storedToken = localStorage.getItem('bizconnect_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('bizconnect_user');
        localStorage.removeItem('bizconnect_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { usernameOrEmail: username, password });
    const { token, id, email, role } = response.data;
    const userData = {
      id,
      username: response.data.username || username,
      email,
      role,
      token,
    };

    localStorage.setItem('bizconnect_token', token);
    localStorage.setItem('bizconnect_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('bizconnect_token');
    localStorage.removeItem('bizconnect_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const isVendor = user?.role === 'ROLE_VENDOR' || user?.role === 'VENDOR';
  const isUser = user?.role === 'ROLE_USER' || user?.role === 'USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isVendor,
        isUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

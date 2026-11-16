import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('connecthub_token');
    const cachedUser = localStorage.getItem('connecthub_user');

    if (token) {
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {}
      }
      // Verify with backend
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('connecthub_user', JSON.stringify(res.data.user));
          getSocket();
        })
        .catch(() => {
          localStorage.removeItem('connecthub_token');
          localStorage.removeItem('connecthub_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrUsername, password) => {
    const res = await api.post('/auth/login', { emailOrUsername, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('connecthub_token', token);
    localStorage.setItem('connecthub_user', JSON.stringify(userData));
    setUser(userData);
    getSocket();
    return userData;
  };

  const register = async (username, email, password, displayName) => {
    const res = await api.post('/auth/register', { username, email, password, displayName });
    const { token, user: userData } = res.data;
    localStorage.setItem('connecthub_token', token);
    localStorage.setItem('connecthub_user', JSON.stringify(userData));
    setUser(userData);
    getSocket();
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('connecthub_token');
    localStorage.removeItem('connecthub_user');
    disconnectSocket();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('tf_user');
    const token  = localStorage.getItem('tf_token');
    if (stored && token) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    const res = await authAPI.register(name, email, password);
    if (res.success) {
      localStorage.setItem('tf_token', res.data.token);
      localStorage.setItem('tf_user',  JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res;
  };

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res.success) {
      localStorage.setItem('tf_token', res.data.token);
      localStorage.setItem('tf_user',  JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await authAPI.logout();
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    setUser(null);
  };

  // ── Role helpers ───────────────────────────────────────────────
  const isAdmin = user?.role === 'admin';
  const isUser  = user?.role === 'user';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAdmin, isUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
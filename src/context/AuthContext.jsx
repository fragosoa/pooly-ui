import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && token !== 'undefined' && storedUser !== 'undefined') {
          setUser(JSON.parse(storedUser));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth init error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { access_token: token, user: userData } = response.data;

    if (!token || !userData) {
      throw new Error('Invalid response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const requestEmailVerification = async (email) => {
    await api.post('/auth/request-verification', { email });
  };

  const forgotPassword = async (email) => {
    await api.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (token, password) => {
    await api.post('/auth/reset-password', { token, password });
  };

  const verifyEmailToken = async (token) => {
    const res = await api.post('/auth/verify-email-token', { token });
    return res.data.email;
  };

  const register = async (username, password, email, allowNotifications = true, verificationToken) => {
    await api.post('/create_user', {
      username,
      password,
      email,
      allow_notifications: allowNotifications,
      verification_token: verificationToken,
    });
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const loginWithGoogle = async (credential) => {
    const response = await api.post('/auth/google', { id_token: credential });
    const { access_token: token, user: userData } = response.data;

    if (!token || !userData) {
      throw new Error('Invalid response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Wait for auth check before rendering
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#6B7280'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateUser, requestEmailVerification, verifyEmailToken, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

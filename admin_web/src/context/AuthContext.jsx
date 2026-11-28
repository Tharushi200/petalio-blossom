import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('petalio_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.avatar && (parsed.avatar.includes('/') || parsed.avatar.includes('.'))) {
          parsed.avatar = parsed.role === 'ADMIN' ? 'KW' : 'AP';
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached auth state:', e);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Synchronize localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('petalio_user', JSON.stringify(user));
      if (!localStorage.getItem('petalio_token')) {
        localStorage.setItem('petalio_token', 'mock_jwt_token_' + user.role);
      }
    } else {
      localStorage.removeItem('petalio_user');
      localStorage.removeItem('petalio_token');
    }
  }, [user]);

  /**
   * Log in using email & password
   * Resilient: tries real Backend API first, falls back smoothly to offline preset.
   */
  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Try real backend API
    try {
      const res = await api.login(cleanEmail, password);
      if (res && res.success && res.user) {
        const liveUser = {
          id: res.user.user_id || res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          avatar: res.user.role === 'ADMIN' ? 'KW' : 'AP'
        };
        setUser(liveUser);
        setLoading(false);
        return { success: true, user: liveUser, source: 'API' };
      }
    } catch (apiErr) {
      console.warn('Live backend unavailable, falling back to local auth verification:', apiErr);
    }

    // 2. Offline fallback verification
    await new Promise((r) => setTimeout(r, 350));

    if (cleanEmail === 'tharushidikkumbura727@gmail.com') {
      if (password === '1234567') {
        const adminUser = MOCK_USERS.admin;
        setUser(adminUser);
        setLoading(false);
        return { success: true, user: adminUser, source: 'OFFLINE' };
      } else {
        setLoading(false);
        return { success: false, error: 'Invalid password.' };
      }
    }

    if (cleanEmail === 'dikkumburatharushi@gmail.com') {
      if (password === '1234567') {
        const officerUser = MOCK_USERS.officer;
        setUser(officerUser);
        setLoading(false);
        return { success: true, user: officerUser, source: 'OFFLINE' };
      } else {
        setLoading(false);
        return { success: false, error: 'Invalid password.' };
      }
    }

    setLoading(false);
    return {
      success: false,
      error: 'Account not recognized. Web dashboards are for Admin & Business Officer only.'
    };
  };

  /**
   * Quick role-based login for evaluation/demo
   */
  const loginAsRole = (role) => {
    if (role === 'ADMIN') {
      setUser(MOCK_USERS.admin);
      return MOCK_USERS.admin;
    } else {
      setUser(MOCK_USERS.officer);
      return MOCK_USERS.officer;
    }
  };

  /**
   * Sign out
   */
  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isOfficer: user?.role === 'BUSINESS_OFFICER',
    login,
    loginAsRole,
    logout,
    loading
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


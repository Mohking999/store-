import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (emailOrPhone: string, passwordPlain: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('phone_tech_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('phone_tech_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.auth.me();
        if (res.user.role === 'CUSTOMER') {
          localStorage.removeItem('phone_tech_token');
          setToken(null);
          setUser(null);
        } else {
          setUser(res.user);
        }
      } catch (err) {
        console.warn('Session verification failed:', err);
        localStorage.removeItem('phone_tech_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (emailOrPhone: string, passwordPlain: string): Promise<User> => {
    const res = await api.auth.login({ emailOrPhone, password: passwordPlain });
    localStorage.setItem('phone_tech_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      localStorage.removeItem('phone_tech_token');
      setToken(null);
      setUser(null);
    }
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, token, isLoading, login, logout } },
    children
  );
};

export const useAuth = () => useContext(AuthContext);

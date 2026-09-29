import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { tokenFor } from './api';

type AuthContextType = {
  userId: string | null;
  currentUser: any | null;
  token: string | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const userId = currentUser?.id || null;
  const token = userId ? tokenFor(userId, currentUser?.chucVu) : null;

  const login = async (username: string, pass: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });
      const body = await res.json();
      
      if (!res.ok) {
        throw new Error(body.error?.message || 'Lỗi đăng nhập');
      }

      const { user, token } = body.data;
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
        return true;
      }
    } catch (e) {
      console.error('Lỗi đăng nhập', e);
      throw e; 
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    window.location.href = '/auth/login';
  };

  return (
    <AuthContext.Provider value={{ userId, currentUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

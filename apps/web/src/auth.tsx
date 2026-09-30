import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { tokenFor } from './api';
import { supabase } from './supabase';

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
      const { data: users, error } = await supabase.from('NhanVien').select('*');
      
      if (error) {
        throw new Error(error.message || 'Lỗi kết nối CSDL');
      }

      const cleanUsername = username.trim().toLowerCase();
      const user = users?.find(u => 
        u.ten?.trim().toLowerCase() === cleanUsername || 
        u.id?.trim().toLowerCase() === cleanUsername ||
        (u.tenDangNhap && u.tenDangNhap.trim().toLowerCase() === cleanUsername)
      );
      
      if (!user) {
        throw new Error('Tài khoản không tồn tại trên hệ thống');
      }

      // Kiểm tra mật khẩu (demo fallback)
      if (user.matKhau && user.matKhau !== pass) {
        throw new Error('Sai mật khẩu');
      } else if (!user.matKhau && pass !== '123456') {
        throw new Error('Sai mật khẩu');
      }

      const { matKhau, ...safeUser } = user;
      localStorage.setItem('auth_user', JSON.stringify(safeUser));
      setCurrentUser(safeUser);
      return true;
    } catch (e) {
      console.error('Lỗi đăng nhập', e);
      throw e; 
    }
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

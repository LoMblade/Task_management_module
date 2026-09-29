import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { tokenFor } from './api';

export const USERS = [
  { id: 'u-giam-doc', ten: 'Nguyễn Đức Dũng', chucVu: 'Giám đốc' },
  { id: 'u-chi-huy', ten: 'Trần Minh Quang', chucVu: 'Chỉ huy công trình' },
  { id: 'u-truong-phong', ten: 'Lê Thị Lan', chucVu: 'Trưởng phòng kỹ thuật' },
  { id: 'u-ky-su-1', ten: 'Phạm Hoàng An', chucVu: 'Kỹ sư xây dựng' },
  { id: 'u-ky-su-2', ten: 'Đỗ Văn Bình', chucVu: 'Kỹ sư điện' },
  { id: 'u-ky-su-3', ten: 'Vũ Thị Mai', chucVu: 'Kỹ sư thủy lợi' },
  { id: 'u-ky-su-4', ten: 'Hoàng Đức Tài', chucVu: 'Kỹ sư giám sát' },
  { id: 'u-to-doi-1', ten: 'Ngô Thanh Hà', chucVu: 'Tổ trưởng thi công' },
  { id: 'u-to-doi-2', ten: 'Bùi Quang Huy', chucVu: 'Tổ trưởng cơ giới' },
  { id: 'u-ke-toan', ten: 'Đinh Thị Ngọc', chucVu: 'Kế toán công trình' },
];

type AuthContextType = {
  userId: string | null;
  currentUser: typeof USERS[0] | null;
  token: string | null;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem('auth_userId');
  });

  const currentUser = userId ? USERS.find(u => u.id === userId) || null : null;
  const token = userId ? tokenFor(userId, currentUser?.chucVu) : null;

  const login = (username: string, pass: string) => {
    // Fake login: Any username from USERS array with password '123456'
    const user = USERS.find(u => u.id === username);
    if (user && pass === '123456') {
      setUserId(user.id);
      localStorage.setItem('auth_userId', user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('auth_userId');
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

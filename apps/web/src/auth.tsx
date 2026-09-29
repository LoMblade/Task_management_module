import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  userId: string;
  setUserId: (id: string) => void;
  token: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState(USERS[0].id);
  const token = tokenFor(userId);

  return (
    <AuthContext.Provider value={{ userId, setUserId, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

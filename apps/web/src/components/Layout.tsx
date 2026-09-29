import React from 'react';
import { useAuth, USERS } from '../auth';

export function Layout({ children }: { children: React.ReactNode }) {
  const { userId, setUserId } = useAuth();

  return (
    <div className="layout">
      <header className="header">
        <h1>ERP Long Đô - Quản lý công việc</h1>
        <div className="user-switcher">
          <label htmlFor="user-select" style={{ marginRight: '1rem' }}>Người dùng hiện tại: </label>
          <select 
            id="user-select" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)}
          >
            {USERS.map(u => (
              <option key={u.id} value={u.id}>
                {u.ten} ({u.chucVu})
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

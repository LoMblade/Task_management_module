import React from 'react';
import { useAuth } from '../auth';

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#ffffff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold', fontSize: '1.2rem', color: '#17211b' }}>
          ERP Long Đỗ
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <div style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', color: '#666' }}>Trang chủ</div>
          <div style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', backgroundColor: '#e6f0fa', color: '#0056b3', fontWeight: 'bold', borderRight: '3px solid #0056b3' }}>
            Quản lý công việc
          </div>
          <div style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', color: '#666' }}>Quản trị hệ thống</div>
          <div style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', color: '#666' }}>Cài đặt hệ thống</div>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ height: '60px', backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <div style={{ fontWeight: '500', color: '#666' }}>
            Quản lý công việc / <span style={{ color: '#17211b' }}>Danh sách công việc</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 'bold' }}>{currentUser?.ten} ({currentUser?.chucVu})</span>
            <button className="btn btn-secondary" onClick={logout}>Đăng xuất</button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

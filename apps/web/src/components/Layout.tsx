import React from 'react';
import { useAuth } from '../auth';

export function Layout({ children, currentMenu, onMenuChange }: { children: React.ReactNode, currentMenu: string, onMenuChange: (menu: string) => void }) {
  const { currentUser, logout } = useAuth();

  const getMenuStyles = (menu: string) => {
    const isActive = currentMenu === menu;
    return {
      padding: '0.75rem 1.5rem',
      cursor: 'pointer',
      color: isActive ? '#0056b3' : '#666',
      backgroundColor: isActive ? '#e6f0fa' : 'transparent',
      fontWeight: isActive ? 'bold' : 'normal',
      borderRight: isActive ? '3px solid #0056b3' : 'none'
    };
  };

  const menuTitle = currentMenu === 'trang-chu' ? 'Trang chủ' : currentMenu === 'nguoi-dung' ? 'Quản trị hệ thống / Danh sách người dùng' : 'Quản lý công việc / Danh sách công việc';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#ffffff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold', fontSize: '1.2rem', color: '#17211b' }}>
          ERP Long Đỗ
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <div style={getMenuStyles('trang-chu')} onClick={() => onMenuChange('trang-chu')}>Trang chủ</div>
          <div style={getMenuStyles('cong-viec')} onClick={() => onMenuChange('cong-viec')}>Quản lý công việc</div>
          <div style={getMenuStyles('nguoi-dung')} onClick={() => onMenuChange('nguoi-dung')}>Quản trị hệ thống</div>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ height: '60px', backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <div style={{ fontWeight: '500', color: '#666' }}>
            {menuTitle}
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

import React from 'react';
import { useAuth } from '../auth';

export function Layout({ children, currentMenu, onMenuChange }: { children: React.ReactNode, currentMenu: string, onMenuChange: (menu: string) => void }) {
  const { currentUser, logout } = useAuth();

  const getMenuStyles = (menu: string) => {
    const isActive = currentMenu === menu;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      margin: '0.2rem 0.75rem',
      cursor: 'pointer',
      color: isActive ? '#ffffff' : '#94a3b8',
      backgroundColor: isActive ? '#1e293b' : 'transparent',
      fontWeight: isActive ? '600' : '500',
      fontSize: '0.875rem',
      borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
      transition: 'all 0.15s ease'
    };
  };

  const menuTitle = currentMenu === 'trang-chu' 
    ? 'Bảng điều khiển & Tổng quan' 
    : currentMenu === 'nguoi-dung' 
    ? 'Quản trị nhân sự & Phân quyền' 
    : 'Quản lý công việc & Tiến độ thi công';

  // Get initial for avatar
  const initial = (currentUser?.ten || 'A').charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Sidebar Doanh Nghiệp */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e293b',
        flexShrink: 0
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#2563eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
          }}>
            LĐ
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f8fafc', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              LONG ĐỖ GROUP
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.04em' }}>
              EPC Project ERP v4.2
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.675rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Nghiệp vụ cốt lõi
          </div>

          <div style={getMenuStyles('trang-chu')} onClick={() => onMenuChange('trang-chu')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            Tổng quan (KPI)
          </div>

          <div style={getMenuStyles('cong-viec')} onClick={() => onMenuChange('cong-viec')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Quản lý công việc
          </div>

          <div style={{ padding: '1.25rem 1.5rem 0.5rem 1.5rem', fontSize: '0.675rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Hệ thống & Cấu hình
          </div>

          <div style={getMenuStyles('nguoi-dung')} onClick={() => onMenuChange('nguoi-dung')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Quản trị nhân sự
          </div>
        </nav>

        {/* User Card in Sidebar Bottom */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #1e293b',
          backgroundColor: '#0a0f1d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1rem'
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.ten || 'Cán bộ'}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.chucVu || 'Thành viên'}
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{
              width: '100%',
              padding: '0.45rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '0.775rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Dự án /</span>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a' }}>
              {menuTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* System Status Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.75rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              color: '#065f46',
              fontWeight: '500'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
              Supabase Cloud Trực tuyến
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Đơn vị: <strong>Tập đoàn Long Đỗ</strong>
            </div>
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

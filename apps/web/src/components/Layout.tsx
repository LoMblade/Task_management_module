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
      {/* Sidebar Doanh Nghiệp - Compact */}
      <aside style={{
        width: '230px',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e293b',
        flexShrink: 0
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            backgroundColor: '#2563eb',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}>
            LĐ
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#f8fafc', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              LONG ĐỖ GROUP
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
              EPC ERP v4.2
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          <div style={{ padding: '0.35rem 1rem', fontSize: '0.625rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Nghiệp vụ
          </div>

          <div style={getMenuStyles('trang-chu')} onClick={() => onMenuChange('trang-chu')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            Tổng quan (KPI)
          </div>

          <div style={getMenuStyles('cong-viec')} onClick={() => onMenuChange('cong-viec')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Quản lý công việc
          </div>

          <div style={{ padding: '0.75rem 1rem 0.35rem 1rem', fontSize: '0.625rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Hệ thống
          </div>

          <div style={getMenuStyles('nguoi-dung')} onClick={() => onMenuChange('nguoi-dung')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          padding: '0.75rem',
          borderTop: '1px solid #1e293b',
          backgroundColor: '#0a0f1d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.ten || 'Cán bộ'}
              </div>
              <div style={{ fontSize: '0.675rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.chucVu || 'Thành viên'}
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{
              width: '100%',
              padding: '0.3rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '4px',
              color: '#f87171',
              fontSize: '0.725rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        {/* Top Header - Slim */}
        <header style={{
          height: '46px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Dự án /</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
              {menuTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.55rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              color: '#065f46',
              fontWeight: '500'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
              Supabase Trực tuyến
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Tập đoàn Long Đỗ
            </div>
          </div>
        </header>

        {/* Page Content - Tight Padding */}
        <main style={{ padding: '0.875rem 1.25rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

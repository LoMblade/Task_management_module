import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth';
import { Layout } from './components/Layout';
import { DanhSachPage } from './pages/DanhSachPage';
import { ChiTietPage } from './pages/ChiTietPage';
import { LoginPage } from './pages/LoginPage';
import { TrangChuPage } from './pages/TrangChuPage';
import { QuanLyNguoiDungPage } from './pages/QuanLyNguoiDungPage';
import './styles.css';

export const queryClient = new QueryClient();

// Helper to map path to menu
function getMenuFromPath(path: string) {
  if (path.startsWith('/users')) return 'nguoi-dung';
  if (path.startsWith('/tasks')) return 'cong-viec';
  return 'trang-chu'; // default to dashboard
}

function getPathFromMenu(menu: string) {
  if (menu === 'nguoi-dung') return '/users';
  if (menu === 'cong-viec') return '/tasks';
  return '/dashboard';
}

function App() {
  const { token, currentUser } = useAuth();
  
  const [currentMenu, setCurrentMenu] = useState(() => getMenuFromPath(window.location.pathname));
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<'view' | 'edit'>('view');

  // Sync URL with menu state
  useEffect(() => {
    if (!token) {
      if (window.location.pathname !== '/auth/login') {
        window.history.replaceState(null, '', '/auth/login');
      }
      return;
    }

    const targetPath = getPathFromMenu(currentMenu);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [currentMenu, token]);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (!token) return;
      setCurrentMenu(getMenuFromPath(window.location.pathname));
      setView('list');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [token]);

  const handleOpenDetail = (id: string, mode: 'view' | 'edit') => {
    setSelectedId(id);
    setDetailMode(mode);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedId(null);
  };

  if (!token) {
    return <LoginPage />;
  }

  const isAdmin = currentUser?.chucVu === 'Giám đốc' || currentUser?.chucVu === 'Tổng giám đốc';

  return (
    <Layout currentMenu={currentMenu} onMenuChange={m => {
      if (m === 'nguoi-dung' && !isAdmin) {
        alert('Chỉ Admin mới có quyền truy cập');
        return;
      }
      setCurrentMenu(m);
      setView('list');
    }}>
      {currentMenu === 'trang-chu' && <TrangChuPage />}
      {currentMenu === 'nguoi-dung' && <QuanLyNguoiDungPage />}
      {currentMenu === 'cong-viec' && (
        <>
          <DanhSachPage onOpenDetail={handleOpenDetail} />
          {view === 'detail' && selectedId && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }} onClick={handleBackToList}>
              <div style={{
                backgroundColor: 'white',
                width: '90%',
                maxWidth: '1000px',
                height: '90vh',
                overflowY: 'auto',
                borderRadius: '8px',
                padding: '2rem'
              }} onClick={e => e.stopPropagation()}>
                <ChiTietPage id={selectedId} mode={detailMode} onBack={handleBackToList} />
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

import { ToastProvider } from './components/Toast';

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>
);

import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth';
import { Layout } from './components/Layout';
import { DanhSachPage } from './pages/DanhSachPage';
import { ChiTietPage } from './pages/ChiTietPage';
import { LoginPage } from './pages/LoginPage';
import './styles.css';

const queryClient = new QueryClient();

function App() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<'view' | 'edit'>('view');
  
  const { token } = useAuth();

  const handleOpenDetail = (id: string, mode: 'view' | 'edit') => {
    setSelectedId(id);
    setDetailMode(mode);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedId(null);
    setView('list');
  };

  if (!token) {
    return <LoginPage />;
  }

  return (
    <Layout>
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
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '8px',
            padding: '2rem'
          }} onClick={e => e.stopPropagation()}>
            <ChiTietPage id={selectedId} mode={detailMode} onBack={handleBackToList} />
          </div>
        </div>
      )}
    </Layout>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);

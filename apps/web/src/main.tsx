import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth';
import { Layout } from './components/Layout';
import { DanhSachPage } from './pages/DanhSachPage';
import { ChiTietPage } from './pages/ChiTietPage';
import './styles.css';

const queryClient = new QueryClient();

function App() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleOpenDetail = (id: string) => {
    setSelectedId(id);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedId(null);
    setView('list');
  };

  return (
    <Layout>
      {view === 'list' && <DanhSachPage onOpenDetail={handleOpenDetail} />}
      {view === 'detail' && selectedId && (
        <ChiTietPage id={selectedId} onBack={handleBackToList} />
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

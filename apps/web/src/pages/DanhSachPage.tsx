import React, { useState } from 'react';
import { useCongViecList } from '../hooks';
import { TaskTable } from '../components/TaskTable';
import { TaskFilters } from '../components/TaskFilters';
import { Pagination } from '../components/Pagination';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { TaskForm } from '../components/TaskForm';

export function DanhSachPage({ onOpenDetail }: { onOpenDetail: (id: string, mode: 'view' | 'edit') => void }) {
  const [filters, setFilters] = useState({ page: 1, limit: 10, scope: 'TAT_CA' });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) searchParams.append(k, String(v));
  });

  const { data, isLoading, error, refetch } = useCongViecList(searchParams);

  const handleTabClick = (scope: string) => {
    setFilters({ ...filters, scope, page: 1 });
  };

  return (
    <div>
      {/* Compact Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Quản lý Công việc & Tiến độ
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Theo dõi phân công, nghiệm thu và đôn đốc hiện trường
          </span>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsFormOpen(true)}
          style={{ height: '30px', padding: '0 0.85rem', backgroundColor: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', fontSize: '0.775rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Giao việc mới
        </button>
      </div>

      {/* Tabs - Slim */}
      <div className="tabs" style={{ marginBottom: '0.5rem' }}>
        {['CUA_TOI', 'TOI_GIAO', 'THEO_DOI', 'TAT_CA'].map(scope => (
          <div 
            key={scope} 
            className={`tab ${filters.scope === scope ? 'active' : ''}`}
            onClick={() => handleTabClick(scope)}
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
          >
            {scope === 'CUA_TOI' ? 'Việc của tôi' :
             scope === 'TOI_GIAO' ? 'Việc tôi giao' :
             scope === 'THEO_DOI' ? 'Đang theo dõi' : 'Tất cả'}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '0.65rem 0.85rem', marginBottom: 0 }}>
        <TaskFilters filters={filters} setFilters={setFilters} />
        
        {isLoading && <LoadingState />}
        {error && <ErrorState error={error as Error} onRetry={refetch} />}
        {!isLoading && !error && data?.data?.length === 0 && <EmptyState message="Không tìm thấy công việc nào" />}
        
        {!isLoading && !error && (data?.data?.length ?? 0) > 0 && (
          <>
            <TaskTable tasks={data!.data} onRowClick={onOpenDetail} />
            <Pagination 
              page={filters.page} 
              limit={filters.limit}
              total={data!.meta?.total || 0} 
              onPageChange={(p) => setFilters({ ...filters, page: p })} 
              onLimitChange={(l) => setFilters({ ...filters, limit: l, page: 1 })}
            />
          </>
        )}
      </div>

      {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}

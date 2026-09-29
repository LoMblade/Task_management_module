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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Danh sách công việc</h2>
        <button className="btn btn-accent" onClick={() => setIsFormOpen(true)}>Giao việc</button>
      </div>

      <div className="tabs">
        {['CUA_TOI', 'TOI_GIAO', 'THEO_DOI', 'TAT_CA'].map(scope => (
          <div 
            key={scope} 
            className={`tab ${filters.scope === scope ? 'active' : ''}`}
            onClick={() => handleTabClick(scope)}
          >
            {scope === 'CUA_TOI' ? 'Việc của tôi' :
             scope === 'TOI_GIAO' ? 'Việc tôi giao' :
             scope === 'THEO_DOI' ? 'Đang theo dõi' : 'Tất cả'}
          </div>
        ))}
      </div>

      <div className="card">
        <TaskFilters filters={filters} setFilters={setFilters} />
        
        {isLoading && <LoadingState />}
        {error && <ErrorState error={error as Error} onRetry={refetch} />}
        {!isLoading && !error && data?.data?.length === 0 && <EmptyState message="Không tìm thấy công việc nào" />}
        
        {!isLoading && !error && (data?.data?.length ?? 0) > 0 && (
          <>
            <TaskTable tasks={data!.data} onRowClick={onOpenDetail} />
            <Pagination 
              page={filters.page} 
              totalPages={Math.ceil((data!.meta?.total || 0) / filters.limit)} 
              onPageChange={(p) => setFilters({ ...filters, page: p })} 
            />
          </>
        )}
      </div>

      {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}

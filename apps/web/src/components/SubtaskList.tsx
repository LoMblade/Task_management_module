import React, { useState } from 'react';
import { useViecCon, useAddViecCon, useUpdateViecCon, useDeleteViecCon } from '../hooks';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

export function SubtaskList({ congViecId, canEdit = true }: { congViecId: string, canEdit?: boolean }) {
  const { data: response, isLoading, error, refetch } = useViecCon(congViecId);
  const addMutation = useAddViecCon();
  const updateMutation = useUpdateViecCon();
  const deleteMutation = useDeleteViecCon();
  
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !canEdit) return;
    addMutation.mutate({ id: congViecId, input: { ten: newTitle, hoanThanh: false } }, {
      onSuccess: () => setNewTitle('')
    });
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;
  
  const viecCons = response?.data || [];
  const completed = viecCons.filter((v: any) => v.hoanThanh || v.daXong).length;
  const total = viecCons.length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Tiến độ việc con: <strong>{completed}/{total}</strong> hạng mục hoàn thành
        </div>
        {total > 0 && (
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: completed === total ? '#059669' : '#2563eb' }}>
            {Math.round((completed / total) * 100)}%
          </div>
        )}
      </div>
      
      {viecCons.length === 0 ? (
        <EmptyState message="Chưa có việc con nào được tạo cho nhiệm vụ này." />
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {viecCons.map((vc: any) => {
            const isDone = Boolean(vc.hoanThanh || vc.daXong);
            return (
              <li 
                key={vc.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.6rem 0.75rem',
                  backgroundColor: isDone ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${isDone ? '#dcfce7' : '#e2e8f0'}`,
                  borderRadius: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={isDone} 
                  disabled={!canEdit}
                  onChange={(e) => updateMutation.mutate({ congViecId, viecConId: vc.id, input: { hoanThanh: e.target.checked } })}
                  style={{ width: '16px', height: '16px', cursor: canEdit ? 'pointer' : 'not-allowed' }}
                />
                <span style={{ 
                  textDecoration: isDone ? 'line-through' : 'none', 
                  color: isDone ? '#15803d' : '#0f172a',
                  fontSize: '0.875rem',
                  flex: 1 
                }}>
                  {vc.ten}
                </span>

                {canEdit && (
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem', color: '#dc2626' }}
                    onClick={() => deleteMutation.mutate({ congViecId, viecConId: vc.id })}
                    title="Xóa việc con"
                  >
                    ×
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      
      {canEdit && (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input 
            className="input" 
            placeholder="Nhập tên việc con cần bổ sung..." 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
            style={{ fontSize: '0.85rem', height: '38px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ height: '38px', padding: '0 1rem' }}>
            + Thêm
          </button>
        </form>
      )}
    </div>
  );
}

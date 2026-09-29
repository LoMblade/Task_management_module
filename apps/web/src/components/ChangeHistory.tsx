import React from 'react';
import { useLichSu, useNhanVien } from '../hooks';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

export function ChangeHistory({ congViecId }: { congViecId: string }) {
  const { data: nhanVienResponse } = useNhanVien();
  const nhanViens = nhanVienResponse?.data || [];
  
  function getUserName(id: string) {
    return nhanViens.find((u: any) => u.id === id)?.ten || id;
  }

  const { data: response, isLoading, error, refetch } = useLichSu(congViecId);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;
  
  const lichSu = response?.data;
  if (!lichSu?.length) return <EmptyState message="Chưa có lịch sử thay đổi nào" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {lichSu.map((ls: any) => (
        <div key={ls.id} style={{ fontSize: '0.9rem', borderLeft: '2px solid #d66a35', paddingLeft: '0.75rem' }}>
          <div>
            <strong>{getUserName(ls.userId)}</strong> đã thay đổi <strong>{ls.truong}</strong>
          </div>
          {ls.tuGiaTri !== undefined && ls.sangGiaTri !== undefined && (
            <div style={{ color: '#666', marginTop: '0.25rem' }}>
              Từ: <em>{ls.tuGiaTri || '(Trống)'}</em> &rarr; Sang: <em>{ls.sangGiaTri || '(Trống)'}</em>
            </div>
          )}
          {ls.lyDo && (
            <div style={{ fontStyle: 'italic', marginTop: '0.25rem', color: '#c62828' }}>
              Lý do/Ghi chú: {ls.lyDo}
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
            {new Date(ls.taoLuc).toLocaleString('vi-VN')}
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';
import { useLichSu } from '../hooks';
import { USERS } from '../auth';

function getUserName(id: string) {
  return USERS.find(u => u.id === id)?.ten || id;
}

export function ChangeHistory({ congViecId }: { congViecId: string }) {
  const { data: response, isLoading } = useLichSu(congViecId);
  const lichSu = response?.data;

  if (isLoading) return <div>Đang tải...</div>;
  if (!lichSu?.length) return <div>Chưa có thay đổi nào.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {lichSu.map((ls: any) => (
        <div key={ls.id} style={{ fontSize: '0.9rem', borderLeft: '2px solid #d66a35', paddingLeft: '0.75rem' }}>
          <div>
            <strong>{getUserName(ls.nguoiThucHienId)}</strong> đã thay đổi <strong>{ls.truongThayDoi}</strong>
          </div>
          {ls.giaTriCu && ls.giaTriMoi && (
            <div style={{ color: '#666', marginTop: '0.25rem' }}>
              Từ: <em>{ls.giaTriCu}</em> &rarr; Sang: <em>{ls.giaTriMoi}</em>
            </div>
          )}
          {ls.ghiChu && (
            <div style={{ fontStyle: 'italic', marginTop: '0.25rem', color: '#c62828' }}>
              Lý do/Ghi chú: {ls.ghiChu}
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
            {new Date(ls.thoiGian).toLocaleString('vi-VN')}
          </div>
        </div>
      ))}
    </div>
  );
}

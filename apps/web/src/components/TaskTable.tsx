import React from 'react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { useNhanVien, useDeleteCongViec, useDuAn } from '../hooks';
import { useAuth } from '../auth';

import { useToast } from './Toast';

export function TaskTable({ tasks, onRowClick }: { tasks: any[], onRowClick: (id: string, mode: 'view' | 'edit') => void }) {
  const { data: nhanVienResponse } = useNhanVien();
  const nhanViens = nhanVienResponse?.data || [];
  const { data: duAnResponse } = useDuAn();
  const duAns = duAnResponse?.data || [];
  const { userId, currentUser } = useAuth();
  const deleteMutation = useDeleteCongViec();
  const toast = useToast();
  
  function getUserName(id: string) {
    return nhanViens.find((u: any) => u.id === id)?.ten || id;
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      deleteMutation.mutate(id, {
        onError: (err: any) => toast.error('Không thể xóa', err.message)
      });
    }
  };

  return (
    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', fontSize: '0.8125rem' }}>
      <thead style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
        <tr>
          <th style={{ padding: '6px 10px', fontSize: '0.725rem' }}>Mã</th>
          <th style={{ padding: '6px 10px', fontSize: '0.725rem' }}>Tên công việc</th>
          <th style={{ padding: '6px 10px', fontSize: '0.725rem' }}>Dự án</th>
          <th style={{ padding: '6px 10px', fontSize: '0.725rem' }}>Người thực hiện</th>
          <th style={{ padding: '6px 10px', fontSize: '0.725rem' }}>Ưu tiên</th>
          <th style={{ padding: '6px 10px', fontSize: '0.725rem' }}>Hạn hoàn thành</th>
          <th style={{ padding: '6px 10px', fontSize: '0.725rem' }}>Trạng thái</th>
          <th style={{ padding: '6px 10px', fontSize: '0.725rem', textAlign: 'center' }}>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map(task => {
          const isOverdue = task.hetHan && new Date(task.hetHan) < new Date() && task.trangThai !== 'HOAN_THANH';
          const isAdmin = currentUser?.chucVu === 'Giám đốc' || currentUser?.chucVu === 'Tổng giám đốc';
          const isGiao = task.nguoiGiaoId === userId || isAdmin;
          const projectName = task.duAnId ? duAns.find((d: any) => d.id === task.duAnId)?.ten || task.duAnId : 'Việc chung';

          return (
            <tr 
              key={task.id} 
              onDoubleClick={() => onRowClick(task.id, 'view')}
              style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={{ padding: '6px 10px', fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>{task.ma}</td>
              <td style={{ padding: '6px 10px', fontWeight: '600', color: '#1e3a8a' }}>{task.ten}</td>
              <td style={{ padding: '6px 10px', color: '#334155' }}>{projectName}</td>
              <td style={{ padding: '6px 10px', color: '#334155' }}>{task.nguoiThucHienIds?.map(getUserName).join(', ')}</td>
              <td style={{ padding: '6px 10px' }}><PriorityBadge priority={task.uuTien} /></td>
              <td style={{ padding: '6px 10px', color: isOverdue ? '#dc2626' : '#334155', fontWeight: isOverdue ? '600' : 'normal' }}>
                {task.hetHan ? new Date(task.hetHan).toLocaleDateString('vi-VN') : '-'}
              </td>
              <td style={{ padding: '6px 10px' }}><StatusBadge status={task.trangThai} /></td>
              <td style={{ padding: '6px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                <button 
                  title="Chi tiết (Read-only)"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', margin: '0 4px', fontSize: '1.1rem' }} 
                  onClick={(e) => { e.stopPropagation(); onRowClick(task.id, 'view'); }}
                >
                  ⚙️
                </button>
                {isGiao && task.trangThai !== 'HOAN_THANH' && (
                  <button 
                    title="Chỉnh sửa"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', margin: '0 4px', fontSize: '1.1rem' }} 
                    onClick={(e) => { e.stopPropagation(); onRowClick(task.id, 'edit'); }}
                  >
                    ✏️
                  </button>
                )}
                {isGiao && task.trangThai !== 'HOAN_THANH' && (
                  <button 
                    title="Xóa"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', margin: '0 4px', fontSize: '1.1rem', color: 'red' }} 
                    onClick={(e) => handleDelete(e, task.id)}
                  >
                    🗑️
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

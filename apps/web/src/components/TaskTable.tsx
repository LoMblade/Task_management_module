import React from 'react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { useNhanVien } from '../hooks';

export function TaskTable({ tasks, onRowClick }: { tasks: any[], onRowClick: (id: string) => void }) {
  const { data: nhanVienResponse } = useNhanVien();
  const nhanViens = nhanVienResponse?.data || [];
  
  function getUserName(id: string) {
    return nhanViens.find((u: any) => u.id === id)?.ten || id;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Mã</th>
          <th>Tên công việc</th>
          <th>Dự án</th>
          <th>Người thực hiện</th>
          <th>Ưu tiên</th>
          <th>Hạn hoàn thành</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map(task => {
          const isOverdue = task.hanHoanThanh && new Date(task.hanHoanThanh) < new Date() && task.trangThai !== 'HOAN_THANH';
          return (
            <tr key={task.id} onClick={() => onRowClick(task.id)} style={{ cursor: 'pointer' }}>
              <td>{task.maCongViec}</td>
              <td>{task.tenCongViec}</td>
              <td>{task.duAnId === 'viec-chung' ? 'Việc chung' : task.duAnId}</td>
              <td>{task.nguoiThucHienIds?.map(getUserName).join(', ')}</td>
              <td><PriorityBadge priority={task.mucDoUuTien} /></td>
              <td className={isOverdue ? 'overdue' : ''}>
                {task.hanHoanThanh ? new Date(task.hanHoanThanh).toLocaleDateString('vi-VN') : '-'}
              </td>
              <td><StatusBadge status={task.trangThai} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

import React, { useState } from 'react';
import { useCongViec, useTransitionCongViec, useDeleteCongViec } from '../hooks';
import { useAuth } from '../auth';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { ChangeHistory } from '../components/ChangeHistory';
import { SubtaskList } from '../components/SubtaskList';
import { CommentSection } from '../components/CommentSection';
import { TaskForm } from '../components/TaskForm';

export function ChiTietPage({ id, onBack }: { id: string, onBack: () => void }) {
  const { data: response, isLoading, error, refetch } = useCongViec(id);
  const { userId } = useAuth();
  const transitionMutation = useTransitionCongViec();
  const deleteMutation = useDeleteCongViec();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;
  const task = response?.data;
  if (!task) return null;

  const isNguoiGiao = task.nguoiGiaoId === userId;
  const isNguoiThucHien = task.nguoiThucHienIds?.includes(userId);
  const isHoanThanh = task.trangThai === 'HOAN_THANH';

  const handleAction = (hanhDong: string, ghiChu?: string) => {
    transitionMutation.mutate({ id, body: { hanhDong, ghiChu } });
  };

  const handleDelete = () => {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      deleteMutation.mutate(id, {
        onSuccess: onBack
      });
    }
  };

  return (
    <div>
      <button className="btn" onClick={onBack} style={{ marginBottom: '1rem' }}>&larr; Quay lại</button>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{task.tenCongViec} ({task.maCongViec})</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <StatusBadge status={task.trangThai} />
              <PriorityBadge priority={task.mucDoUuTien} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isNguoiGiao && !isHoanThanh && (
              <>
                <button className="btn btn-accent" onClick={() => setIsEditOpen(true)}>Sửa</button>
                <button className="btn" style={{ backgroundColor: '#c62828' }} onClick={handleDelete}>Xóa</button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <p><strong>Mô tả:</strong> {task.moTa || 'Không có'}</p>
            <p><strong>Dự án:</strong> {task.duAnId}</p>
            <p><strong>Ngày bắt đầu:</strong> {task.ngayBatDau ? new Date(task.ngayBatDau).toLocaleDateString('vi-VN') : '-'}</p>
            <p><strong>Hạn hoàn thành:</strong> {task.hanHoanThanh ? new Date(task.hanHoanThanh).toLocaleDateString('vi-VN') : '-'}</p>
          </div>
          <div>
            <p><strong>Người giao:</strong> {task.nguoiGiaoId}</p>
            <p><strong>Người thực hiện:</strong> {task.nguoiThucHienIds?.join(', ')}</p>
            <p><strong>Người theo dõi:</strong> {task.nguoiTheoDoiIds?.join(', ')}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          {!isHoanThanh && isNguoiThucHien && task.trangThai === 'CHUA_BAT_DAU' && (
            <button className="btn btn-accent" onClick={() => handleAction('BAT_DAU')}>Bắt đầu làm</button>
          )}
          {!isHoanThanh && isNguoiThucHien && task.trangThai === 'DANG_LAM' && (
            <button className="btn btn-accent" onClick={() => handleAction('BAO_CAO_HOAN_THANH')}>Gửi duyệt</button>
          )}
          {!isHoanThanh && isNguoiGiao && task.trangThai === 'CHO_DUYET' && (
            <>
              <button className="btn" style={{ backgroundColor: '#2e7d32', color: 'white' }} onClick={() => handleAction('DUYET')}>Duyệt</button>
              {!showRejectInput ? (
                <button className="btn" style={{ backgroundColor: '#c62828', color: 'white' }} onClick={() => setShowRejectInput(true)}>Từ chối</button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="form-control" placeholder="Lý do từ chối..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                  <button className="btn" style={{ backgroundColor: '#c62828', color: 'white' }} onClick={() => handleAction('TU_CHOI', rejectReason)}>Xác nhận</button>
                  <button className="btn" onClick={() => setShowRejectInput(false)}>Hủy</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div>
          <div className="card">
            <h3>Việc con</h3>
            <SubtaskList congViecId={id} />
          </div>
          <div className="card">
            <h3>Bình luận</h3>
            <CommentSection congViecId={id} />
          </div>
        </div>
        <div>
          <div className="card">
            <h3>Lịch sử thay đổi</h3>
            <ChangeHistory congViecId={id} />
          </div>
        </div>
      </div>

      {isEditOpen && <TaskForm task={task} onClose={() => setIsEditOpen(false)} />}
    </div>
  );
}

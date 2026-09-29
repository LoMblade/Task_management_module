import React, { useState, useEffect } from 'react';
import { useCongViec, useTransitionCongViec, useDeleteCongViec, useUpdateCongViec, useNhanVien } from '../hooks';
import { useAuth } from '../auth';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { ChangeHistory } from '../components/ChangeHistory';
import { SubtaskList } from '../components/SubtaskList';
import { CommentSection } from '../components/CommentSection';
import { TaskForm } from '../components/TaskForm';

export function ChiTietPage({ id, mode, onBack }: { id: string, mode: 'view' | 'edit', onBack: () => void }) {
  const { data: response, isLoading, error, refetch } = useCongViec(id);
  const { data: nhanVienResponse } = useNhanVien();
  const nhanViens = nhanVienResponse?.data || [];
  
  const { userId, currentUser } = useAuth();
  const transitionMutation = useTransitionCongViec();
  const deleteMutation = useDeleteCongViec();
  const updateMutation = useUpdateCongViec();

  const [isEditOpen, setIsEditOpen] = useState(mode === 'edit');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    setIsEditOpen(mode === 'edit');
  }, [mode]);

  function getUserName(uId: string) {
    return nhanViens.find((u: any) => u.id === uId)?.ten || uId;
  }

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;
  const task = response?.data;
  if (!task) return null;

  const isAdmin = currentUser?.chucVu === 'Giám đốc' || currentUser?.chucVu === 'Tổng giám đốc';
  const isNguoiGiao = task.nguoiGiaoId === userId || isAdmin;
  const isNguoiThucHien = task.nguoiThucHienIds?.includes(userId) || isAdmin;
  const isHoanThanh = task.trangThai === 'HOAN_THANH';

  const handleTransition = (trangThai: string, lyDo?: string) => {
    transitionMutation.mutate({ id, body: { trangThai, lyDo } });
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      deleteMutation.mutate(id, {
        onSuccess: onBack
      });
    }
  };

  if (isEditOpen && !isHoanThanh && isNguoiGiao) {
    return <TaskForm task={task} onClose={() => { setIsEditOpen(false); if (mode === 'edit') onBack(); }} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e0e0e0', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0056b3' }}>{task.ten} ({task.ma})</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <StatusBadge status={task.trangThai} />
            <PriorityBadge priority={task.uuTien} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isNguoiGiao && !isHoanThanh && (
            <>
              <button className="btn btn-accent" onClick={() => setIsEditOpen(true)}>✏️ Sửa</button>
              <button className="btn" style={{ backgroundColor: '#c62828', color: 'white' }} onClick={handleDelete}>🗑️ Xóa</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <p><strong>Mô tả:</strong> {task.moTa || 'Không có'}</p>
          <p><strong>Dự án:</strong> {task.duAnId === 'viec-chung' ? 'Việc chung' : (task.duAnId || 'Việc chung')}</p>
          <p><strong>Ngày bắt đầu:</strong> {task.batDau ? new Date(task.batDau).toLocaleDateString('vi-VN') : '-'}</p>
          <p><strong>Hạn hoàn thành:</strong> {task.hetHan ? new Date(task.hetHan).toLocaleDateString('vi-VN') : '-'}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ margin: 0 }}><strong>Tiến độ:</strong> {task.tienDo}%</p>
            {!isHoanThanh && isNguoiThucHien && task.trangThai === 'DANG_LAM' && (
              <input 
                type="range" 
                min="0" max="100" step="5" 
                defaultValue={task.tienDo}
                onMouseUp={(e) => {
                  const val = Number((e.target as HTMLInputElement).value);
                  if (val !== task.tienDo) {
                    updateMutation.mutate({ id, input: { tienDo: val } });
                  }
                }}
              />
            )}
          </div>
        </div>
        <div>
          <p><strong>Người giao:</strong> {getUserName(task.nguoiGiaoId)}</p>
          <p><strong>Người thực hiện:</strong> {task.nguoiThucHienIds?.map(getUserName).join(', ')}</p>
          <p><strong>Người theo dõi:</strong> {task.nguoiTheoDoiIds?.map(getUserName).join(', ')}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {!isHoanThanh && isNguoiThucHien && task.trangThai === 'CHUA_BAT_DAU' && (
          <button className="btn btn-accent" onClick={() => handleTransition('DANG_LAM')}>▶️ Bắt đầu làm</button>
        )}
        {!isHoanThanh && isNguoiThucHien && task.trangThai === 'DANG_LAM' && (
          <button className="btn btn-accent" onClick={() => handleTransition('CHO_DUYET')}>✅ Gửi duyệt</button>
        )}
        {!isHoanThanh && isNguoiGiao && task.trangThai === 'CHO_DUYET' && (
          <>
            <button className="btn" style={{ backgroundColor: '#2e7d32', color: 'white' }} onClick={() => handleTransition('HOAN_THANH')}>Duyệt hoàn thành</button>
            {!showRejectInput ? (
              <button className="btn" style={{ backgroundColor: '#c62828', color: 'white' }} onClick={() => setShowRejectInput(true)}>Từ chối</button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="text" className="input" placeholder="Lý do từ chối..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                <button className="btn" style={{ backgroundColor: '#c62828', color: 'white' }} onClick={() => handleTransition('DANG_LAM', rejectReason)}>Xác nhận</button>
                <button className="btn btn-secondary" onClick={() => setShowRejectInput(false)}>Hủy</button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div>
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Việc con</h3>
            <SubtaskList congViecId={id} />
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Bình luận</h3>
            <CommentSection congViecId={id} />
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Lịch sử thay đổi</h3>
            <ChangeHistory congViecId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

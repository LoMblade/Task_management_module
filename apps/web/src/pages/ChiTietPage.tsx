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
import { useToast } from '../components/Toast';

export function ChiTietPage({ id, mode, onBack }: { id: string, mode: 'view' | 'edit', onBack: () => void }) {
  const { data: response, isLoading, error, refetch } = useCongViec(id);
  const { data: nhanVienResponse } = useNhanVien();
  const nhanViens = nhanVienResponse?.data || [];
  
  const { userId, currentUser } = useAuth();
  const toast = useToast();
  const transitionMutation = useTransitionCongViec();
  const deleteMutation = useDeleteCongViec();
  const updateMutation = useUpdateCongViec();

  const [isEditOpen, setIsEditOpen] = useState(mode === 'edit');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [progressInput, setProgressInput] = useState<number | null>(null);

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

  // Ma trận phân quyền chính xác theo yêu cầu:
  const isAdmin = currentUser?.chucVu === 'Giám đốc' || currentUser?.chucVu === 'Tổng giám đốc';
  const isNguoiGiao = task.nguoiGiaoId === userId || isAdmin;
  const isNguoiThucHien = task.nguoiThucHienIds?.includes(userId) || isAdmin;
  const isNguoiTheoDoi = task.nguoiTheoDoiIds?.includes(userId);
  const isHoanThanh = task.trangThai === 'HOAN_THANH';

  // Xác định nhãn quyền hiển thị cho người xem
  let roleBadge = { text: 'Nhân sự xem thông tin (Chỉ xem)', bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
  if (isAdmin) {
    roleBadge = { text: 'Lãnh đạo / Quản trị viên (Toàn quyền)', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  } else if (isNguoiGiao) {
    roleBadge = { text: 'Người giao việc (Sửa mọi thông tin, Duyệt / Trả lại, Xóa)', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
  } else if (isNguoiThucHien) {
    roleBadge = { text: 'Người thực hiện (Cập nhật tiến độ, Gửi duyệt - Không sửa thông tin chung)', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
  } else if (isNguoiTheoDoi) {
    roleBadge = { text: 'Người theo dõi (Chỉ xem)', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  }

  const handleTransition = (trangThai: string, lyDo?: string) => {
    // Kiểm tra bắt buộc ghi lý do khi trả lại
    if (trangThai === 'DANG_LAM' && task.trangThai === 'CHO_DUYET') {
      if (!lyDo || !lyDo.trim()) {
        toast.error('Bắt buộc nhập lý do', 'Vui lòng nhập lý do trả lại để người thực hiện biết và điều chỉnh.');
        return;
      }
    }

    transitionMutation.mutate({ id, body: { trangThai, lyDo } }, {
      onSuccess: () => {
        setShowRejectInput(false);
        setRejectReason('');
        toast.success('Chuyển trạng thái thành công', `Đã chuyển sang: ${trangThai}`);
      },
      onError: (err: any) => toast.error('Lỗi chuyển trạng thái', err.message)
    });
  };

  const handleSaveProgress = () => {
    if (progressInput === null || progressInput === task.tienDo) return;
    updateMutation.mutate({ id, input: { tienDo: progressInput } }, {
      onSuccess: () => toast.success('Đã cập nhật tiến độ', `Tiến độ hiện tại: ${progressInput}%`),
      onError: (err: any) => toast.error('Lỗi cập nhật tiến độ', err.message)
    });
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn công việc này?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Đã xóa công việc');
          onBack();
        },
        onError: (err: any) => toast.error('Lỗi khi xóa', err.message)
      });
    }
  };

  // Người giao hoặc Admin có quyền mở form sửa mọi thông tin
  if (isEditOpen && !isHoanThanh && isNguoiGiao) {
    return <TaskForm task={task} onClose={() => { setIsEditOpen(false); if (mode === 'edit') onBack(); }} />;
  }

  return (
    <div>
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <button 
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          ← Quay lại danh sách
        </button>

        {/* User Role Indicator Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          backgroundColor: roleBadge.bg,
          color: roleBadge.color,
          border: `1px solid ${roleBadge.border}`,
          borderRadius: '9999px',
          fontSize: '0.775rem',
          fontWeight: '600'
        }}>
          {roleBadge.text}
        </div>
      </div>

      {/* Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Mã nhiệm vụ: {task.ma}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.75rem 0' }}>
              {task.ten}
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <StatusBadge status={task.trangThai} />
              <PriorityBadge priority={task.uuTien} />
            </div>
          </div>
          
          {/* Nút hành động cho NGƯỜI GIAO (Sửa mọi thông tin, Xóa) */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isNguoiGiao && !isHoanThanh && (
              <button 
                className="btn btn-primary" 
                onClick={() => setIsEditOpen(true)}
                title="Người giao có quyền sửa mọi thông tin công việc"
              >
                ✏️ Chỉnh sửa công việc
              </button>
            )}
            {isNguoiGiao && (
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
                title="Xóa công việc khỏi hệ thống"
              >
                🗑️ Xóa
              </button>
            )}
          </div>
        </div>

        {/* Thanh tác vụ chuyển trạng thái (Quy trình luân chuyển nhiệm vụ) */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.775rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Hành động theo thẩm quyền:
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* 1. NGƯỜI THỰC HIỆN: Chưa bắt đầu -> Đang làm */}
            {!isHoanThanh && isNguoiThucHien && task.trangThai === 'CHUA_BAT_DAU' && (
              <button 
                className="btn btn-primary" 
                style={{ backgroundColor: '#2563eb' }}
                onClick={() => handleTransition('DANG_LAM')}
              >
                ▶️ Bắt đầu triển khai (Chuyển Đang làm)
              </button>
            )}

            {/* 2. NGƯỜI THỰC HIỆN: Đang làm -> Chờ duyệt */}
            {!isHoanThanh && isNguoiThucHien && task.trangThai === 'DANG_LAM' && (
              <button 
                className="btn btn-primary" 
                style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
                onClick={() => handleTransition('CHO_DUYET')}
              >
                📤 Gửi duyệt nghiệm thu (Chuyển Chờ duyệt)
              </button>
            )}

            {/* 3. NGƯỜI GIAO / LÃNH ĐẠO: Duyệt hoàn thành hoặc Trả lại (bắt buộc lý do) */}
            {!isHoanThanh && isNguoiGiao && task.trangThai === 'CHO_DUYET' && (
              <>
                <button 
                  className="btn btn-primary" 
                  style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                  onClick={() => handleTransition('HOAN_THANH')}
                >
                  ✓ Duyệt nghiệm thu (Chuyển Hoàn thành)
                </button>

                {!showRejectInput ? (
                  <button 
                    className="btn btn-danger" 
                    onClick={() => setShowRejectInput(true)}
                  >
                    ↩️ Trả lại (Yêu cầu làm lại)
                  </button>
                ) : (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    backgroundColor: '#fef2f2',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #fecaca'
                  }}>
                    <input 
                      type="text" 
                      className="input" 
                      style={{ minWidth: '280px', height: '36px', fontSize: '0.85rem' }}
                      placeholder="* Nhập lý do trả lại (bắt buộc)..." 
                      value={rejectReason} 
                      onChange={e => setRejectReason(e.target.value)} 
                    />
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleTransition('DANG_LAM', rejectReason)}
                    >
                      Xác nhận trả lại
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Thông báo trạng thái nếu là Người theo dõi hoặc người xem không có quyền chuyển */}
            {!isNguoiGiao && !isNguoiThucHien && (
              <span style={{ fontSize: '0.825rem', color: '#64748b', fontStyle: 'italic' }}>
                🔒 Bạn có quyền xem nhiệm vụ này. Chỉ Người giao việc hoặc Người thực hiện mới có quyền chuyển trạng thái.
              </span>
            )}

            {isHoanThanh && (
              <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '600' }}>
                ✓ Công việc đã được nghiệm thu hoàn thành. Không thể chỉnh sửa hoặc chuyển trạng thái.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Thông tin chi tiết & Cập nhật tiến độ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Cột trái: Thông số và Tiến độ */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            Thông số kỹ thuật & Kế hoạch
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div>
              <strong style={{ color: '#475569' }}>Mô tả nhiệm vụ:</strong>
              <div style={{ marginTop: '0.25rem', color: '#1e293b', whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                {task.moTa || 'Không có mô tả chi tiết.'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#475569' }}>Dự án / Gói thầu:</strong>
                <div style={{ color: '#0f172a', fontWeight: '600', marginTop: '0.2rem' }}>
                  {task.duAnId === 'viec-chung' || !task.duAnId ? 'Việc chung không theo dự án' : (task.duAnId)}
                </div>
              </div>
              <div>
                <strong style={{ color: '#475569' }}>Kế hoạch thời gian:</strong>
                <div style={{ color: '#0f172a', marginTop: '0.2rem' }}>
                  {task.batDau ? new Date(task.batDau).toLocaleDateString('vi-VN') : 'Chưa đặt'} → <strong>{task.hetHan ? new Date(task.hetHan).toLocaleDateString('vi-VN') : 'Không hạn'}</strong>
                </div>
              </div>
            </div>

            {/* Khu vực CẬP NHẬT TIẾN ĐỘ */}
            <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>Tiến độ thực hiện:</strong>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: task.tienDo === 100 ? '#059669' : '#2563eb' }}>
                  {progressInput !== null ? progressInput : task.tienDo}%
                </span>
              </div>

              {/* Thanh tiến độ trực quan */}
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div style={{
                  width: `${progressInput !== null ? progressInput : task.tienDo}%`,
                  height: '100%',
                  backgroundColor: task.tienDo === 100 ? '#059669' : '#2563eb',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Quyền cập nhật tiến độ: Dành cho NGƯỜI THỰC HIỆN hoặc ADMIN khi đang làm */}
              {!isHoanThanh && isNguoiThucHien && task.trangThai === 'DANG_LAM' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5" 
                      value={progressInput !== null ? progressInput : task.tienDo}
                      onChange={(e) => setProgressInput(Number(e.target.value))}
                      style={{ flex: 1, cursor: 'pointer' }}
                    />
                    {progressInput !== null && progressInput !== task.tienDo && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={handleSaveProgress}
                      >
                        Lưu {progressInput}%
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.35rem' }}>
                    💡 Kéo thanh trượt để cập nhật tỷ lệ hoàn thành công việc hiện trường.
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                  {isHoanThanh ? 'Công việc đã nghiệm thu 100%.' : 'Tiến độ chỉ có thể điều chỉnh khi công việc ở trạng thái "Đang làm" bởi Người thực hiện.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Phân công nhân sự */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            Phân bổ Nhân sự Phụ trách
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            {/* Người giao việc */}
            <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: '700', color: '#15803d', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Người giao việc (Chỉ huy / Quản lý)
              </div>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>
                {getUserName(task.nguoiGiaoId)}
              </div>
            </div>

            {/* Người thực hiện */}
            <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Người thực hiện chính ({task.nguoiThucHienIds?.length || 0})
              </div>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>
                {task.nguoiThucHienIds?.map(getUserName).join(', ') || 'Chưa phân công'}
              </div>
            </div>

            {/* Người theo dõi */}
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Cán bộ theo dõi giám sát ({task.nguoiTheoDoiIds?.length || 0})
              </div>
              <div style={{ color: '#334155' }}>
                {task.nguoiTheoDoiIds?.length ? task.nguoiTheoDoiIds.map(getUserName).join(', ') : 'Không có người theo dõi'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Việc con & Bình luận & Lịch sử */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div>
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>
              Danh mục Việc con (Hạng mục chi tiết)
            </h3>
            <SubtaskList congViecId={id} canEdit={isNguoiGiao || isNguoiThucHien} />
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>
              Ý kiến chỉ đạo & Trao đổi nghiệp vụ
            </h3>
            <CommentSection congViecId={id} />
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>
              Nhật ký Lịch sử Thay đổi (Audit Trail)
            </h3>
            <ChangeHistory congViecId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

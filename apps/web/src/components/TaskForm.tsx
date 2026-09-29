import React, { useState } from 'react';
import { useCreateCongViec, useUpdateCongViec, useNhanVien, useDuAn } from '../hooks';

export function TaskForm({ task, onClose }: { task?: any, onClose: () => void }) {
  const isEdit = !!task;
  const createMutation = useCreateCongViec();
  const updateMutation = useUpdateCongViec();
  const { data: nhanVienResponse } = useNhanVien();
  const { data: duAnResponse } = useDuAn();
  
  const nhanViens = nhanVienResponse?.data || [];
  const duAns = duAnResponse?.data || [];

  const [formData, setFormData] = useState({
    ten: task?.ten || '',
    moTa: task?.moTa || '',
    duAnId: task?.duAnId || '',
    uuTien: task?.uuTien || 'BINH_THUONG',
    batDau: task?.batDau ? new Date(task.batDau).toISOString().split('T')[0] : '',
    hetHan: task?.hetHan ? new Date(task.hetHan).toISOString().split('T')[0] : '',
    nguoiThucHienIds: task?.nguoiThucHienIds || [],
    nguoiTheoDoiIds: task?.nguoiTheoDoiIds || [],
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.hetHan && formData.batDau && new Date(formData.hetHan) < new Date(formData.batDau)) {
      setError('Hạn không được trước ngày bắt đầu');
      return;
    }
    if (formData.nguoiThucHienIds.length === 0) {
      setError('Chọn ít nhất một người thực hiện');
      return;
    }

    const payload: any = { ...formData };
    if (!payload.batDau) delete payload.batDau;
    if (!payload.hetHan) delete payload.hetHan;
    if (payload.duAnId === 'viec-chung' || !payload.duAnId) {
      delete payload.duAnId;
    }

    if (isEdit) {
      updateMutation.mutate({ id: task.id, input: payload }, { 
        onSuccess: onClose,
        onError: (err: any) => setError(err.message || 'Có lỗi xảy ra')
      });
    } else {
      createMutation.mutate(payload, { 
        onSuccess: onClose,
        onError: (err: any) => setError(err.message || 'Có lỗi xảy ra')
      });
    }
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>, field: string) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, [field]: values });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '8px',
        padding: '2rem'
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#17211b' }}>
          {isEdit ? 'Sửa công việc' : 'Giao việc mới'}
        </h2>
        
        {error && <div style={{ color: '#c62828', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tên công việc <span style={{ color: 'red' }}>*</span></label>
            <input 
              type="text" 
              className="input"
              value={formData.ten} 
              onChange={e => setFormData({ ...formData, ten: e.target.value })} 
              required 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mô tả</label>
            <textarea 
              className="input"
              style={{ minHeight: '80px' }}
              value={formData.moTa} 
              onChange={e => setFormData({ ...formData, moTa: e.target.value })} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Dự án</label>
              <select 
                className="input"
                value={formData.duAnId || 'viec-chung'} 
                onChange={e => setFormData({ ...formData, duAnId: e.target.value })}
              >
                <option value="viec-chung">-- Việc chung --</option>
                {duAns.map((da: any) => (
                  <option key={da.id} value={da.id}>{da.ten}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mức độ ưu tiên</label>
              <select 
                className="input"
                value={formData.uuTien} 
                onChange={e => setFormData({ ...formData, uuTien: e.target.value })}
              >
                <option value="THAP">Thấp</option>
                <option value="BINH_THUONG">Bình thường</option>
                <option value="CAO">Cao</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Ngày bắt đầu</label>
              <input 
                type="date" 
                className="input"
                value={formData.batDau} 
                onChange={e => setFormData({ ...formData, batDau: e.target.value })} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Hạn hoàn thành</label>
              <input 
                type="date" 
                className="input"
                value={formData.hetHan} 
                onChange={e => setFormData({ ...formData, hetHan: e.target.value })} 
              />
            </div>
          </div>

          {!isEdit && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Người thực hiện <span style={{ color: 'red' }}>*</span></label>
                <select 
                  multiple 
                  className="input"
                  style={{ minHeight: '120px' }}
                  value={formData.nguoiThucHienIds} 
                  onChange={e => handleMultiSelect(e, 'nguoiThucHienIds')}
                  required
                >
                  {nhanViens.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.ten} ({u.chucVu})</option>
                  ))}
                </select>
                <small style={{ color: '#666' }}>Giữ Ctrl để chọn nhiều</small>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Người theo dõi</label>
                <select 
                  multiple 
                  className="input"
                  style={{ minHeight: '120px' }}
                  value={formData.nguoiTheoDoiIds} 
                  onChange={e => handleMultiSelect(e, 'nguoiTheoDoiIds')}
                >
                  {nhanViens.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.ten} ({u.chucVu})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-accent" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

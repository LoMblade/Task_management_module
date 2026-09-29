import React, { useState } from 'react';
import { useCreateCongViec, useUpdateCongViec } from '../hooks';
import { USERS } from '../auth';

export function TaskForm({ task, onClose }: { task?: any, onClose: () => void }) {
  const isEdit = !!task;
  const createMutation = useCreateCongViec();
  const updateMutation = useUpdateCongViec();

  const [formData, setFormData] = useState({
    tenCongViec: task?.tenCongViec || '',
    moTa: task?.moTa || '',
    duAnId: task?.duAnId || 'viec-chung',
    mucDoUuTien: task?.mucDoUuTien || 'TRUNG_BINH',
    ngayBatDau: task?.ngayBatDau ? new Date(task.ngayBatDau).toISOString().split('T')[0] : '',
    hanHoanThanh: task?.hanHoanThanh ? new Date(task.hanHoanThanh).toISOString().split('T')[0] : '',
    nguoiThucHienIds: task?.nguoiThucHienIds || [],
    nguoiTheoDoiIds: task?.nguoiTheoDoiIds || [],
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.hanHoanThanh && formData.ngayBatDau && new Date(formData.hanHoanThanh) < new Date(formData.ngayBatDau)) {
      setError('Hạn hoàn thành không thể trước ngày bắt đầu');
      return;
    }

    const payload = { ...formData };
    if (!payload.ngayBatDau) delete (payload as any).ngayBatDau;
    if (!payload.hanHoanThanh) delete (payload as any).hanHoanThanh;

    if (isEdit) {
      updateMutation.mutate({ id: task.id, input: payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>, field: string) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, [field]: values });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isEdit ? 'Sửa công việc' : 'Giao việc mới'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên công việc *</label>
            <input required className="form-control" value={formData.tenCongViec} onChange={e => setFormData({...formData, tenCongViec: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea className="form-control" value={formData.moTa} onChange={e => setFormData({...formData, moTa: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Dự án</label>
            <select className="form-control" value={formData.duAnId} onChange={e => setFormData({...formData, duAnId: e.target.value})}>
              <option value="viec-chung">Việc chung</option>
              <option value="du-an-1">Dự án 1</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mức độ ưu tiên</label>
            <select className="form-control" value={formData.mucDoUuTien} onChange={e => setFormData({...formData, mucDoUuTien: e.target.value})}>
              <option value="THAP">Thấp</option>
              <option value="TRUNG_BINH">Trung bình</option>
              <option value="CAO">Cao</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input type="date" className="form-control" value={formData.ngayBatDau} onChange={e => setFormData({...formData, ngayBatDau: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Hạn hoàn thành</label>
              <input type="date" className="form-control" value={formData.hanHoanThanh} onChange={e => setFormData({...formData, hanHoanThanh: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Người thực hiện</label>
              <select multiple className="form-control" value={formData.nguoiThucHienIds} onChange={e => handleMultiSelect(e, 'nguoiThucHienIds')}>
                {USERS.map(u => <option key={u.id} value={u.id}>{u.ten}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Người theo dõi</label>
              <select multiple className="form-control" value={formData.nguoiTheoDoiIds} onChange={e => handleMultiSelect(e, 'nguoiTheoDoiIds')}>
                {USERS.map(u => <option key={u.id} value={u.id}>{u.ten}</option>)}
              </select>
            </div>
          </div>
          
          {error && <div className="error-text">{error}</div>}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-accent" disabled={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

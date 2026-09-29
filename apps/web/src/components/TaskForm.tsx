import React, { useState } from 'react';
import { useCreateCongViec, useUpdateCongViec, useNhanVien, useDuAn } from '../hooks';
import { useToast } from './Toast';
import { taoCongViecSchema, capNhatCongViecSchema } from '@erp/contracts';

export function TaskForm({ task, onClose }: { task?: any, onClose: () => void }) {
  const isEdit = !!task;
  const createMutation = useCreateCongViec();
  const updateMutation = useUpdateCongViec();
  const { data: nhanVienResponse } = useNhanVien();
  const { data: duAnResponse } = useDuAn();
  const toast = useToast();
  
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
    setError(null);
    
    const payload: any = { ...formData };
    if (!payload.batDau) delete payload.batDau;
    if (!payload.hetHan) delete payload.hetHan;
    if (payload.duAnId === 'viec-chung' || !payload.duAnId) {
      delete payload.duAnId;
    }

    try {
      if (isEdit) {
        capNhatCongViecSchema.parse(payload);
        updateMutation.mutate({ id: task.id, input: payload }, { 
          onSuccess: () => { onClose(); toast.success('Cập nhật công việc thành công'); },
          onError: (err: any) => toast.error('Lỗi cập nhật', err.message)
        });
      } else {
        taoCongViecSchema.parse(payload);
        createMutation.mutate(payload, { 
          onSuccess: () => { onClose(); toast.success('Giao việc mới thành công'); },
          onError: (err: any) => toast.error('Lỗi giao việc', err.message)
        });
      }
    } catch (err: any) {
      if (err.errors) {
        toast.error('Lỗi dữ liệu', err.errors[0].message);
      } else {
        toast.error('Lỗi', err.message);
      }
    }
  };

  const toggleNguoiThucHien = (id: string) => {
    setFormData(prev => ({
      ...prev,
      nguoiThucHienIds: prev.nguoiThucHienIds.includes(id) 
        ? prev.nguoiThucHienIds.filter((x: string) => x !== id)
        : [...prev.nguoiThucHienIds, id]
    }));
  };

  const toggleNguoiTheoDoi = (id: string) => {
    setFormData(prev => ({
      ...prev,
      nguoiTheoDoiIds: prev.nguoiTheoDoiIds.includes(id) 
        ? prev.nguoiTheoDoiIds.filter((x: string) => x !== id)
        : [...prev.nguoiTheoDoiIds, id]
    }));
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
        
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{isEdit ? 'Sửa công việc' : 'Giao việc mới'}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Tên công việc *</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.ten} 
              onChange={e => setFormData({ ...formData, ten: e.target.value })}
              placeholder="VD: Nghiệm thu..."
            />
          </div>

          <div>
            <label className="form-label">Mô tả</label>
            <textarea 
              className="form-control" 
              rows={3} 
              value={formData.moTa} 
              onChange={e => setFormData({ ...formData, moTa: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Dự án</label>
              <select className="form-control" value={formData.duAnId} onChange={e => setFormData({ ...formData, duAnId: e.target.value })}>
                <option value="viec-chung">Việc chung (Không thuộc dự án)</option>
                {duAns.map((da: any) => (
                  <option key={da.id} value={da.id}>{da.ten}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Độ ưu tiên</label>
              <select className="form-control" value={formData.uuTien} onChange={e => setFormData({ ...formData, uuTien: e.target.value })}>
                <option value="THAP">Thấp</option>
                <option value="BINH_THUONG">Bình thường</option>
                <option value="CAO">Cao</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Ngày bắt đầu</label>
              <input 
                type="date" 
                className="form-control" 
                value={formData.batDau} 
                onChange={e => setFormData({ ...formData, batDau: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Hạn hoàn thành</label>
              <input 
                type="date" 
                className="form-control" 
                value={formData.hetHan} 
                onChange={e => setFormData({ ...formData, hetHan: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Người thực hiện * (Chọn ít nhất 1)</label>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem' }}>
              {nhanViens.map((nv: any) => (
                <div key={nv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <input 
                    type="checkbox" 
                    id={`th-${nv.id}`}
                    checked={formData.nguoiThucHienIds.includes(nv.id)}
                    onChange={() => toggleNguoiThucHien(nv.id)}
                  />
                  <label htmlFor={`th-${nv.id}`}>{nv.ten} ({nv.chucVu})</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Người theo dõi</label>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem' }}>
              {nhanViens.map((nv: any) => (
                <div key={nv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <input 
                    type="checkbox" 
                    id={`td-${nv.id}`}
                    checked={formData.nguoiTheoDoiIds.includes(nv.id)}
                    onChange={() => toggleNguoiTheoDoi(nv.id)}
                  />
                  <label htmlFor={`td-${nv.id}`}>{nv.ten} ({nv.chucVu})</label>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-accent">{isEdit ? 'Lưu thay đổi' : 'Tạo công việc'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

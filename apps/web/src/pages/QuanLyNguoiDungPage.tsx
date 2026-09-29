import React, { useState } from 'react';
import { useNhanVien, useCreateNhanVien, useUpdateNhanVien, useDeleteNhanVien } from '../hooks';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { passwordSchema } from '@erp/contracts';

import { useToast } from '../components/Toast';

export function QuanLyNguoiDungPage() {
  const toast = useToast();
  const { data: response, isLoading, error, refetch } = useNhanVien();
  const createMutation = useCreateNhanVien();
  const updateMutation = useUpdateNhanVien();
  const deleteMutation = useDeleteNhanVien();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;

  const users = response?.data || [];

  const handleEdit = (u: any) => {
    setEditingUser(u);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Đã xóa nhân viên'),
        onError: (err: any) => toast.error('Lỗi xóa', err.message)
      });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (data: any) => {
    if (editingUser) {
      updateMutation.mutate({ id: data.id, input: data }, { 
        onSuccess: () => { closeForm(); toast.success('Sửa thành công'); },
        onError: (err: any) => toast.error('Lỗi sửa', err.message)
      });
    } else {
      createMutation.mutate(data, { 
        onSuccess: () => { closeForm(); toast.success('Thêm mới thành công'); },
        onError: (err: any) => toast.error('Lỗi thêm mới', err.message)
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#17211b' }}>
          Thông tin người dùng <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal', borderLeft: '1px solid #ccc', paddingLeft: '10px', marginLeft: '10px' }}>Danh sách người dùng</span>
        </h2>
        <button className="btn btn-accent" onClick={() => setIsFormOpen(true)}>+ Thêm mới</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead style={{ backgroundColor: '#f4f6f8', borderBottom: '2px solid #e0e0e0' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Mã người dùng (ID)</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Tên hiển thị</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Phân quyền / Chức vụ</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{u.id}</td>
                <td style={{ padding: '12px 16px' }}>{u.ten}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ backgroundColor: u.chucVu.includes('Giám đốc') ? '#ffebee' : '#e8f5e9', color: u.chucVu.includes('Giám đốc') ? '#c62828' : '#2e7d32', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {u.chucVu}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button className="btn" style={{ padding: '4px 8px', minWidth: 'auto', backgroundColor: 'transparent', color: '#0056b3' }} onClick={() => handleEdit(u)}>✏️</button>
                  <button className="btn" style={{ padding: '4px 8px', minWidth: 'auto', backgroundColor: 'transparent', color: '#c62828' }} onClick={() => handleDelete(u.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e0e0e0', backgroundColor: '#fafafa', textAlign: 'right', fontSize: '0.9rem', color: '#666' }}>
          Tổng cộng: <strong>{users.length}</strong> bản ghi
        </div>
      </div>

      {isFormOpen && (
        <UserForm user={editingUser} onClose={closeForm} onSubmit={handleSubmit} />
      )}
    </div>
  );
}

function UserForm({ user, onClose, onSubmit }: { user: any, onClose: () => void, onSubmit: (d: any) => void }) {
  const [formData, setFormData] = useState({
    id: user?.id || '',
    ten: user?.ten || '',
    chucVu: user?.chucVu || 'Nhân viên',
    matKhau: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload: any = { ...formData };
      
      // Validate with Zod manually since we can't use top-level easily in component without creating new schemas
      if (!payload.id) throw new Error('User ID là bắt buộc');
      if (!payload.ten) throw new Error('Tên hiển thị là bắt buộc');
      
      if (!user) {
        if (!payload.matKhau) throw new Error('Vui lòng nhập mật khẩu mới');
        passwordSchema.parse(payload.matKhau);
      } else {
        if (!payload.matKhau) {
          delete payload.matKhau; // dont send to API if empty
        } else {
          passwordSchema.parse(payload.matKhau);
        }
      }
      
      onSubmit(payload);
    } catch (err: any) {
      if (err.errors) setError(err.errors[0].message);
      else setError(err.message);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', width: '500px', borderRadius: '8px', padding: '2rem'
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{user ? 'Sửa người dùng' : 'Thêm thông tin người dùng'}</h2>
        
        {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mã người dùng (User ID) *</label>
            <input className="input" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} disabled={!!user} placeholder="VD: u-ky-su-5" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tên hiển thị *</label>
            <input className="input" value={formData.ten} onChange={e => setFormData({ ...formData, ten: e.target.value })} placeholder="VD: Nguyễn Văn A" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Chức vụ (Role) *</label>
            <select className="input" value={formData.chucVu} onChange={e => setFormData({ ...formData, chucVu: e.target.value })} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
              <option value="Giám đốc">Giám đốc (Admin - Full quyền)</option>
              <option value="Chỉ huy công trình">Chỉ huy công trình</option>
              <option value="Trưởng phòng kỹ thuật">Trưởng phòng kỹ thuật</option>
              <option value="Kỹ sư">Kỹ sư</option>
              <option value="Nhân viên">Nhân viên</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Mật khẩu {user ? 'mới' : ''} {user ? '(Để trống nếu không đổi)' : '*'}
              <span title="Mật khẩu phải chứa ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt" style={{ marginLeft: '8px', cursor: 'help', color: '#888' }}>ℹ️</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input" 
                value={formData.matKhau} 
                onChange={e => setFormData({ ...formData, matKhau: e.target.value })} 
                placeholder="Nhập mật khẩu" 
                style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ padding: '0 12px' }}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Quay lại</button>
            <button type="submit" className="btn btn-accent">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}

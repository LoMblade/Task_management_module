import React, { useState } from 'react';
import { useNhanVien, useCreateNhanVien, useUpdateNhanVien, useDeleteNhanVien } from '../hooks';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useToast } from '../components/Toast';

export function QuanLyNguoiDungPage() {
  const toast = useToast();
  const { data: response, isLoading, error, refetch } = useNhanVien();
  const createMutation = useCreateNhanVien();
  const updateMutation = useUpdateNhanVien();
  const deleteMutation = useDeleteNhanVien();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;

  const users: any[] = response?.data || [];

  const filteredUsers = users.filter((u: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      u.ten?.toLowerCase().includes(q) ||
      u.chucVu?.toLowerCase().includes(q)
    );
  });

  const handleEdit = (u: any) => {
    setEditingUser(u);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, ten: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhân viên "${ten}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Đã xóa nhân viên'),
        onError: (err: any) => toast.error('Lỗi xóa nhân viên', err.message)
      });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (data: any) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, input: data }, { 
        onSuccess: () => { 
          closeForm(); 
          toast.success('Cập nhật nhân viên thành công'); 
        },
        onError: (err: any) => toast.error('Lỗi cập nhật', err.message)
      });
    } else {
      createMutation.mutate(data, { 
        onSuccess: () => { 
          closeForm(); 
          toast.success('Thêm mới nhân viên thành công'); 
        },
        onError: (err: any) => toast.error('Lỗi thêm mới', err.message)
      });
    }
  };

  const getRoleStyle = (chucVu: string = '') => {
    if (chucVu.includes('Giám đốc') || chucVu.includes('Tổng giám đốc')) {
      return { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' };
    }
    if (chucVu.includes('Trưởng phòng') || chucVu.includes('Chỉ huy')) {
      return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    }
    if (chucVu.includes('Kỹ sư') || chucVu.includes('Tổ trưởng')) {
      return { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' };
    }
    if (chucVu.includes('Kế toán')) {
      return { bg: '#faf5ff', color: '#6b21a8', border: '#e9d5ff' };
    }
    return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  const getInitials = (name: string = '') => {
    if (!name) return 'NV';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
            Quản lý Nhân sự & Người dùng
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
            Danh sách nhân sự, phân quyền điều hành trong hệ thống ERP Long Đỗ
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="text"
            className="input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc chức vụ..."
            style={{
              padding: '6px 12px',
              fontSize: '0.85rem',
              width: '240px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1'
            }}
          />
          <button 
            className="btn btn-accent" 
            onClick={() => { setEditingUser(null); setIsFormOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '6px 14px' }}
          >
            <span>+</span> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '10px 14px', width: '50px', textAlign: 'center', color: '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                STT
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Họ và Tên Nhân viên
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Phân quyền / Chức vụ
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'center', width: '130px', color: '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Trạng thái
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'right', width: '110px', color: '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy nhân viên phù hợp
                </td>
              </tr>
            ) : (
              filteredUsers.map((u: any, index: number) => {
                const roleStyle = getRoleStyle(u.chucVu);
                const initials = getInitials(u.ten);

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#e2e8f0',
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>
                          {u.ten}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        backgroundColor: roleStyle.bg,
                        color: roleStyle.color,
                        border: `1px solid ${roleStyle.border}`,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {u.chucVu || 'Nhân viên'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                        Hoạt động
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          className="btn"
                          title="Chỉnh sửa thông tin"
                          style={{
                            padding: '4px 8px',
                            minWidth: 'auto',
                            backgroundColor: 'transparent',
                            color: '#2563eb',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleEdit(u)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn"
                          title="Xóa nhân viên"
                          style={{
                            padding: '4px 8px',
                            minWidth: 'auto',
                            backgroundColor: 'transparent',
                            color: '#dc2626',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleDelete(u.id, u.ten)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.825rem',
          color: '#64748b'
        }}>
          <div>
            Hiển thị <strong>{filteredUsers.length}</strong> / <strong>{users.length}</strong> nhân sự
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Hệ thống phân quyền ERP Long Đỗ
          </div>
        </div>
      </div>

      {isFormOpen && (
        <UserForm user={editingUser} onClose={closeForm} onSubmit={handleSubmit} />
      )}
    </div>
  );
}

function UserForm({ user, onClose, onSubmit }: { user: any; onClose: () => void; onSubmit: (d: any) => void }) {
  const [formData, setFormData] = useState({
    ten: user?.ten || '',
    chucVu: user?.chucVu || 'Nhân viên',
    matKhau: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = formData.ten.trim();
    if (!trimmedName) {
      setError('Họ và tên nhân viên là bắt buộc');
      return;
    }

    if (!user) {
      if (!formData.matKhau) {
        setError('Vui lòng thiết lập mật khẩu ban đầu cho nhân viên');
        return;
      }
      if (formData.matKhau.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
    } else {
      if (formData.matKhau && formData.matKhau.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }
    }

    const payload: any = {
      ten: trimmedName,
      chucVu: formData.chucVu,
    };

    if (formData.matKhau) {
      payload.matKhau = formData.matKhau;
    }

    onSubmit(payload);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '460px',
        maxWidth: '92vw',
        borderRadius: '10px',
        padding: '1.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
            {user ? 'Chỉnh sửa thông tin nhân viên' : 'Thêm mới nhân viên'}
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.25rem', 
              cursor: 'pointer', 
              color: '#94a3b8' 
            }}
          >
            ×
          </button>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '0.625rem 0.875rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#334155' }}>
              Họ và tên nhân viên <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input 
              className="input" 
              value={formData.ten} 
              onChange={e => setFormData({ ...formData, ten: e.target.value })} 
              placeholder="VD: Nguyễn Văn Hoàng" 
              style={{ width: '100%', padding: '8px 10px', boxSizing: 'border-box', fontSize: '0.875rem', borderRadius: '6px' }} 
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#334155' }}>
              Chức vụ / Phân quyền <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select 
              className="input" 
              value={formData.chucVu} 
              onChange={e => setFormData({ ...formData, chucVu: e.target.value })} 
              style={{ width: '100%', padding: '8px 10px', boxSizing: 'border-box', fontSize: '0.875rem', borderRadius: '6px' }}
            >
              <option value="Giám đốc">Giám đốc (Admin - Toàn quyền hệ thống)</option>
              <option value="Chỉ huy công trình">Chỉ huy công trình</option>
              <option value="Trưởng phòng kỹ thuật">Trưởng phòng kỹ thuật</option>
              <option value="Kỹ sư xây dựng">Kỹ sư xây dựng</option>
              <option value="Kỹ sư điện">Kỹ sư điện</option>
              <option value="Kỹ sư thủy lợi">Kỹ sư thủy lợi</option>
              <option value="Kỹ sư giám sát">Kỹ sư giám sát</option>
              <option value="Tổ trưởng thi công">Tổ trưởng thi công</option>
              <option value="Kế toán công trình">Kế toán công trình</option>
              <option value="Nhân viên">Nhân viên</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#334155' }}>
              Mật khẩu {user ? 'mới' : ''} {user ? '(Để trống nếu giữ nguyên)' : <span style={{ color: '#dc2626' }}>*</span>}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input" 
                value={formData.matKhau} 
                onChange={e => setFormData({ ...formData, matKhau: e.target.value })} 
                placeholder={user ? 'Nhập mật khẩu mới nếu muốn đổi' : 'Tối thiểu 6 ký tự (VD: 123456)'} 
                style={{ flex: 1, padding: '8px 10px', boxSizing: 'border-box', fontSize: '0.875rem', borderRadius: '6px' }}
              />
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowPassword(!showPassword)} 
                style={{ padding: '0 12px', fontSize: '0.9rem', borderRadius: '6px' }}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
            {!user && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Mật khẩu mặc định gợi ý: <code>123456</code>
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ padding: '7px 16px', fontSize: '0.85rem' }}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-accent"
              style={{ padding: '7px 18px', fontSize: '0.85rem' }}
            >
              {user ? 'Lưu thay đổi' : 'Tạo nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

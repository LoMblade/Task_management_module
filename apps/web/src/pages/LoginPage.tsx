import React, { useState } from 'react';
import { useAuth } from '../auth';
import { useToast } from '../components/Toast';

export function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Đăng nhập thành công', 'Đang kết nối vào hệ thống điều hành...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } else {
        toast.error('Lỗi xác thực', 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (e: any) {
      toast.error('Lỗi xác thực', e.message || 'Không thể kết nối tới cơ sở dữ liệu Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Tổng Giám đốc (Admin)', user: 'admin', role: 'Full quyền hệ thống' },
    { label: 'Chỉ huy trưởng', user: 'chihuy', role: 'Quản lý hiện trường' },
    { label: 'Trưởng phòng Kỹ thuật', user: 'truongphong', role: 'Phê duyệt hồ sơ' },
    { label: 'Kỹ sư xây dựng', user: 'kysu1', role: 'Thi công trực tiếp' },
    { label: 'Kế toán công trình', user: 'ketoan', role: 'Thanh quyết toán' }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      {/* Cột trái: Giới thiệu hệ thống ERP doanh nghiệp */}
      <div style={{
        flex: '1.2',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)',
        color: '#ffffff',
        padding: '4rem 5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative architectural lines */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.04)',
          pointerEvents: 'none'
        }} />

        {/* Brand Header */}
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              backgroundColor: '#2563eb',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.25rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                LONG ĐỖ GROUP
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                EPC & Infrastructure Construction
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            color: '#60a5fa',
            marginBottom: '2rem',
            fontWeight: '500'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60a5fa' }}></span>
            Cổng điều hành công tác thi công & dự án số
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            lineHeight: '1.2',
            fontWeight: '700',
            color: '#f8fafc',
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em'
          }}>
            Hệ thống Quản trị Tiến độ & Điều hành Dự án Toàn diện
          </h1>

          <p style={{
            fontSize: '1.05rem',
            lineHeight: '1.6',
            color: '#94a3b8',
            maxWidth: '520px',
            marginBottom: '3rem'
          }}>
            Chuẩn hóa quy trình giao việc, kiểm soát chất lượng hiện trường, giải quyết vướng mắc thi công và bóc tách khối lượng thanh quyết toán theo thời gian thực.
          </p>

          {/* 3 Core pillars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#f1f5f9' }}>Giám sát tiến độ theo thời gian thực</div>
                <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>Phân cấp giao việc chi tiết từ Ban Giám đốc đến từng Kỹ sư, Tổ đội công trường.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#f1f5f9' }}>Kiểm soát chất lượng & Minh bạch hồ sơ</div>
                <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>Lưu vết lịch sử thay đổi thông số, việc con và tương tác ý kiến nghiệp vụ tức thời.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.5rem',
          fontSize: '0.775rem',
          color: '#64748b',
          zIndex: 1
        }}>
          <div>Bảo mật chứng chỉ SSL 256-bit • ISO/IEC 27001</div>
          <div>Cơ sở dữ liệu Supabase Enterprise</div>
        </div>
      </div>

      {/* Cột phải: Form đăng nhập chuẩn doanh nghiệp */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
              Đăng nhập hệ thống
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Nhập mã nhân viên hoặc định danh phân quyền để truy cập
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                Tài khoản cán bộ / Nhân viên
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="input" 
                  style={{
                    paddingLeft: '2.5rem',
                    fontSize: '0.9rem',
                    height: '44px',
                    borderColor: '#cbd5e1'
                  }}
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="Ví dụ: admin, u-chi-huy..."
                  required 
                />
                <svg style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: '600', color: '#334155', margin: 0 }}>
                  Mật khẩu truy cập
                </label>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', cursor: 'pointer' }} onClick={() => toast.info('Mật khẩu mẫu mặc định là 123456')}>
                  Mặc định: 123456
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  className="input" 
                  style={{
                    paddingLeft: '2.5rem',
                    fontSize: '0.9rem',
                    height: '44px',
                    borderColor: '#cbd5e1'
                  }}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Nhập mật khẩu..."
                  required 
                />
                <svg style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{
                width: '100%',
                height: '44px',
                fontSize: '0.95rem',
                fontWeight: '600',
                backgroundColor: '#1e3a8a',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Đang xác thực...' : 'Truy cập Bảng điều khiển'}
            </button>
          </form>

          {/* Quick Demo Switcher cho buổi thuyết trình với khách hàng lớn */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Tài khoản Demo nhanh (Dành cho trình diễn):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {demoAccounts.map(acc => (
                <button
                  key={acc.user}
                  type="button"
                  onClick={() => {
                    setUsername(acc.user);
                    setPassword('123456');
                    toast.info('Đã chọn tài khoản', `${acc.label} (${acc.role})`);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: username === acc.user ? '#eff6ff' : '#f8fafc',
                    border: `1px solid ${username === acc.user ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.775rem', fontWeight: '600', color: username === acc.user ? '#1d4ed8' : '#1e293b' }}>
                    {acc.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {acc.role}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

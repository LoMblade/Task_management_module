import React, { useState } from 'react';
import { useAuth } from '../auth';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456'); // pre-filled for convenience
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f4f6f8'
    }}>
      <div className="card" style={{ width: '400px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#17211b' }}>Đăng nhập hệ thống</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '10px', backgroundColor: '#ffebe9', borderRadius: '4px' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Tên đăng nhập (VD: u-chi-huy, u-giam-doc)</label>
            <input 
              type="text" 
              className="input" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Nhập tên đăng nhập..."
              required 
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              className="input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '1rem' }}>
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

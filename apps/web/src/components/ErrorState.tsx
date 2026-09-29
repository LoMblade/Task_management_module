import React from 'react';

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="card" style={{ textAlign: 'center', color: '#c62828' }}>
      <h3>Đã xảy ra lỗi</h3>
      <p>{error.message}</p>
      <button className="btn" onClick={onRetry}>Thử lại</button>
    </div>
  );
}

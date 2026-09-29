import React from 'react';

export function EmptyState({ message = 'Không có dữ liệu' }: { message?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <p>{message}</p>
    </div>
  );
}

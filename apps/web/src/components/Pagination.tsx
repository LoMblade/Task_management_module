import React from 'react';

export function Pagination({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
      <button 
        className="btn" 
        disabled={page <= 1} 
        onClick={() => onPageChange(page - 1)}
      >
        Trước
      </button>
      <span style={{ padding: '0.5rem' }}>Trang {page} / {totalPages}</span>
      <button 
        className="btn" 
        disabled={page >= totalPages} 
        onClick={() => onPageChange(page + 1)}
      >
        Sau
      </button>
    </div>
  );
}

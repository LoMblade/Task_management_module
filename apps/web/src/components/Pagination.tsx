import React from 'react';

export function Pagination({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
      <button 
        className="btn btn-secondary btn-sm" 
        disabled={page <= 1} 
        onClick={() => onPageChange(page - 1)}
        style={{ height: '26px', padding: '0 0.5rem', fontSize: '0.75rem' }}
      >
        ‹ Trước
      </button>
      <span style={{ padding: '0 0.5rem', fontSize: '0.775rem', color: '#64748b' }}>
        Trang <strong>{page}</strong> / {totalPages}
      </span>
      <button 
        className="btn btn-secondary btn-sm" 
        disabled={page >= totalPages} 
        onClick={() => onPageChange(page + 1)}
        style={{ height: '26px', padding: '0 0.5rem', fontSize: '0.75rem' }}
      >
        Sau ›
      </button>
    </div>
  );
}

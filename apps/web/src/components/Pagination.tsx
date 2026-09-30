import React from 'react';

export function Pagination({ 
  page, 
  limit, 
  total, 
  onPageChange, 
  onLimitChange 
}: { 
  page: number; 
  limit: number; 
  total: number; 
  onPageChange: (p: number) => void;
  onLimitChange?: (l: number) => void;
}) {
  const totalPages = Math.ceil(total / limit);
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = total > 0 ? Math.min(page * limit, total) : 0;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'flex-end', 
      alignItems: 'center', 
      gap: '1rem', 
      marginTop: '1rem',
      fontSize: '0.85rem',
      color: '#475569'
    }}>
      <div style={{ marginRight: 'auto', fontWeight: 500 }}>
        Tổng cộng: {total} bản ghi
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Items per page:</span>
        <select 
          className="form-select form-select-sm" 
          style={{ width: 'auto', height: '30px', padding: '0 1.5rem 0 0.5rem', fontSize: '0.85rem' }}
          value={limit}
          onChange={(e) => onLimitChange?.(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <button 
        className="btn btn-secondary btn-sm"
        style={{ height: '30px', padding: '0 0.75rem', fontSize: '0.85rem' }}
        onClick={() => onLimitChange?.(total > 0 ? total : 10)}
      >
        All
      </button>

      <span>
        {startItem} - {endItem} of {total}
      </span>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          disabled={page <= 1} 
          onClick={() => onPageChange(1)}
          style={{ height: '30px', padding: '0 0.5rem', display: 'flex', alignItems: 'center' }}
          title="Trang đầu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
          </svg>
        </button>
        <button 
          className="btn btn-secondary btn-sm" 
          disabled={page <= 1} 
          onClick={() => onPageChange(page - 1)}
          style={{ height: '30px', padding: '0 0.5rem', display: 'flex', alignItems: 'center' }}
          title="Trang trước"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button 
          className="btn btn-secondary btn-sm" 
          disabled={page >= totalPages || totalPages === 0} 
          onClick={() => onPageChange(page + 1)}
          style={{ height: '30px', padding: '0 0.5rem', display: 'flex', alignItems: 'center' }}
          title="Trang sau"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button 
          className="btn btn-secondary btn-sm" 
          disabled={page >= totalPages || totalPages === 0} 
          onClick={() => onPageChange(totalPages)}
          style={{ height: '30px', padding: '0 0.5rem', display: 'flex', alignItems: 'center' }}
          title="Trang cuối"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

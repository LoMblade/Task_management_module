import React from 'react';

export function TaskFilters({ filters, setFilters }: { filters: any, setFilters: (f: any) => void }) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <input 
        name="search" 
        value={filters.search || ''} 
        onChange={handleChange} 
        placeholder="Tìm kiếm..." 
        className="form-control" 
        style={{ width: '200px' }}
      />
      <select name="duAnId" value={filters.duAnId || ''} onChange={handleChange} className="form-control" style={{ width: '150px' }}>
        <option value="">Tất cả dự án</option>
        <option value="viec-chung">Việc chung</option>
        {/* Can be populated from API */}
      </select>
      <select name="trangThai" value={filters.trangThai || ''} onChange={handleChange} className="form-control" style={{ width: '150px' }}>
        <option value="">Tất cả trạng thái</option>
        <option value="CHUA_BAT_DAU">Chưa bắt đầu</option>
        <option value="DANG_LAM">Đang làm</option>
        <option value="CHO_DUYET">Chờ duyệt</option>
        <option value="HOAN_THANH">Hoàn thành</option>
        <option value="QUA_HAN">Quá hạn</option>
      </select>
      <select name="mucDoUuTien" value={filters.mucDoUuTien || ''} onChange={handleChange} className="form-control" style={{ width: '150px' }}>
        <option value="">Tất cả ưu tiên</option>
        <option value="CAO">Cao</option>
        <option value="TRUNG_BINH">Trung bình</option>
        <option value="THAP">Thấp</option>
      </select>
    </div>
  );
}

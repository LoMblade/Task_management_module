import React from 'react';
import { useDuAn } from '../hooks';

export function TaskFilters({ filters, setFilters }: { filters: any, setFilters: (f: any) => void }) {
  const { data: duAnResponse } = useDuAn();
  const duAns = duAnResponse?.data || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <input 
        name="search" 
        value={filters.search || ''} 
        onChange={handleChange} 
        placeholder="🔍 Tìm kiếm công việc..." 
        className="form-control" 
        style={{ width: '180px', height: '30px', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
      />
      <select name="duAnId" value={filters.duAnId || ''} onChange={handleChange} className="form-control" style={{ width: '140px', height: '30px', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
        <option value="">Tất cả dự án</option>
        <option value="viec-chung">Việc chung</option>
        {duAns.map((d: any) => (
          <option key={d.id} value={d.id}>{d.ten}</option>
        ))}
      </select>
      <select name="trangThai" value={filters.trangThai || ''} onChange={handleChange} className="form-control" style={{ width: '130px', height: '30px', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
        <option value="">Tất cả trạng thái</option>
        <option value="CHUA_BAT_DAU">Chưa bắt đầu</option>
        <option value="DANG_LAM">Đang làm</option>
        <option value="CHO_DUYET">Chờ duyệt</option>
        <option value="HOAN_THANH">Hoàn thành</option>
      </select>
      <select name="uuTien" value={filters.uuTien || ''} onChange={handleChange} className="form-control" style={{ width: '120px', height: '30px', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
        <option value="">Tất cả ưu tiên</option>
        <option value="CAO">Cao</option>
        <option value="BINH_THUONG">Bình thường</option>
        <option value="THAP">Thấp</option>
      </select>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
        <input 
          type="checkbox" 
          name="quaHan" 
          checked={!!filters.quaHan} 
          onChange={(e) => setFilters({ ...filters, quaHan: e.target.checked ? true : undefined, page: 1 })}
        />
        Quá hạn
      </label>
    </div>
  );
}

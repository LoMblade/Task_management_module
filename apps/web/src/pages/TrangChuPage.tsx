import React from 'react';
import { useCongViecList, useNhanVien } from '../hooks';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export function TrangChuPage() {
  const searchParams = new URLSearchParams();
  searchParams.append('limit', '100');
  searchParams.append('scope', 'TAT_CA');
  
  const { data: response, isLoading, error, refetch } = useCongViecList(searchParams);
  const { data: nhanVienResponse } = useNhanVien();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;
  
  const tasks = response?.data || [];
  const nhanViens = nhanVienResponse?.data || [];

  // Tính thống kê theo người thực hiện
  const statsByAssignee: Record<string, { id: string, name: string, chuaBatDau: number, dangLam: number, hoanThanh: number, tong: number, quaHan: number }> = {};
  
  tasks.forEach(t => {
    (t.nguoiThucHienIds || []).forEach((userId: string) => {
      if (!statsByAssignee[userId]) {
        const user = nhanViens.find((u: any) => u.id === userId);
        statsByAssignee[userId] = { id: userId, name: user?.ten || userId, chuaBatDau: 0, dangLam: 0, hoanThanh: 0, tong: 0, quaHan: 0 };
      }
      
      statsByAssignee[userId].tong++;
      if (t.trangThai === 'CHUA_BAT_DAU') statsByAssignee[userId].chuaBatDau++;
      else if (t.trangThai === 'DANG_LAM' || t.trangThai === 'CHO_DUYET') statsByAssignee[userId].dangLam++;
      else if (t.trangThai === 'HOAN_THANH') statsByAssignee[userId].hoanThanh++;

      if (t.hetHan && new Date(t.hetHan) < new Date() && t.trangThai !== 'HOAN_THANH') {
        statsByAssignee[userId].quaHan++;
      }
    });
  });

  const statsList = Object.values(statsByAssignee).sort((a, b) => b.tong - a.tong);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#17211b' }}>Dashboard <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal' }}>Thao tác nghiệp vụ</span></h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Table 1: Hoạt động chung */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#0056b3', color: 'white', padding: '10px 15px', fontWeight: 'bold' }}>
            Hoạt động chung
          </div>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f6f8' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Người nhận xử lý</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Chưa bắt đầu</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Đang xử lý</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Hoàn thành</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {statsList.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu</td></tr>
              )}
              {statsList.map((stat, idx) => (
                <tr key={stat.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', color: '#0056b3' }}>{stat.name}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{stat.chuaBatDau}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{stat.dangLam}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{stat.hoanThanh}</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{stat.tong}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table 2: Tác vụ quá hạn */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#0056b3', color: 'white', padding: '10px 15px', fontWeight: 'bold' }}>
            Tác vụ quá hạn
          </div>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f6f8' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Người nhận xử lý</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Số tác vụ quá hạn</th>
              </tr>
            </thead>
            <tbody>
              {statsList.filter(s => s.quaHan > 0).length === 0 && (
                <tr><td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu</td></tr>
              )}
              {statsList.filter(s => s.quaHan > 0).map((stat, idx) => (
                <tr key={stat.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', color: '#0056b3' }}>{stat.name}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#c62828', fontWeight: 'bold' }}>{stat.quaHan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

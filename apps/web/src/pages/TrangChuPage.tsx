import React from 'react';
import { useCongViecList, useNhanVien, useDuAn } from '../hooks';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export function TrangChuPage() {
  const searchParams = new URLSearchParams();
  searchParams.append('limit', '100');
  searchParams.append('scope', 'TAT_CA');
  
  const { data: response, isLoading, error, refetch } = useCongViecList(searchParams);
  const { data: nhanVienResponse } = useNhanVien();
  const { data: duAnResponse } = useDuAn();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;
  
  const tasks = response?.data || [];
  const nhanViens = nhanVienResponse?.data || [];
  const duAns = duAnResponse?.data || [];

  // Tổng hợp KPI
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.trangThai === 'DANG_LAM').length;
  const pendingTasks = tasks.filter(t => t.trangThai === 'CHO_DUYET').length;
  const completedTasks = tasks.filter(t => t.trangThai === 'HOAN_THANH').length;
  const overdueTasks = tasks.filter(t => t.hetHan && new Date(t.hetHan) < new Date() && t.trangThai !== 'HOAN_THANH').length;

  // Tính thống kê theo người thực hiện
  const statsByAssignee: Record<string, { id: string, name: string, chucVu: string, chuaBatDau: number, dangLam: number, hoanThanh: number, tong: number, quaHan: number }> = {};
  
  tasks.forEach(t => {
    (t.nguoiThucHienIds || []).forEach((userId: string) => {
      if (!statsByAssignee[userId]) {
        const user = nhanViens.find((u: any) => u.id === userId);
        statsByAssignee[userId] = { 
          id: userId, 
          name: user?.ten || userId, 
          chucVu: user?.chucVu || 'Nhân sự',
          chuaBatDau: 0, 
          dangLam: 0, 
          hoanThanh: 0, 
          tong: 0, 
          quaHan: 0 
        };
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
      {/* Header Page - Compact */}
      <div style={{ marginBottom: '0.65rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.15rem 0' }}>
          Tổng quan Tiến độ & Hiệu suất Dự án
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
          Báo cáo thống kê thời gian thực từ hiện trường thi công và các ban điều hành gói thầu
        </p>
      </div>
      
      {/* KPI Cards Strip - Slim */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div className="stat-card" style={{ padding: '0.65rem 0.85rem' }}>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb', width: '32px', height: '32px', fontSize: '1rem' }}>
            📋
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tổng công việc
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.2' }}>
              {totalTasks}
            </div>
            <div style={{ fontSize: '0.675rem', color: '#059669' }}>
              Trên {duAns.length} gói thầu dự án
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '0.65rem 0.85rem' }}>
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669', width: '32px', height: '32px', fontSize: '1rem' }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Đang thi công
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#059669', lineHeight: '1.2' }}>
              {inProgressTasks}
            </div>
            <div style={{ fontSize: '0.675rem', color: '#64748b' }}>
              Chiếm {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}% khối lượng
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '0.65rem 0.85rem' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706', width: '32px', height: '32px', fontSize: '1rem' }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Chờ nghiệm thu
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#d97706', lineHeight: '1.2' }}>
              {pendingTasks}
            </div>
            <div style={{ fontSize: '0.675rem', color: '#64748b' }}>
              Cần lãnh đạo phê duyệt
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '0.65rem 0.85rem' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626', width: '32px', height: '32px', fontSize: '1rem' }}>
            ⚠️
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tác vụ trễ hạn
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#dc2626', lineHeight: '1.2' }}>
              {overdueTasks}
            </div>
            <div style={{ fontSize: '0.675rem', color: '#dc2626' }}>
              Cần đôn đốc hiện trường
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Hai bảng điều hành */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
        {/* Table 1: Phân bổ khối lượng theo nhân sự */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 0 }}>
          <div style={{
            padding: '0.6rem 0.85rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                Phân bổ khối lượng theo nhân sự
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Tiến độ giải quyết công việc của từng cá nhân phụ trách
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '600' }}>
              {statsList.length} nhân sự
            </span>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Cán bộ phụ trách</th>
                  <th style={{ textAlign: 'center' }}>Chưa làm</th>
                  <th style={{ textAlign: 'center' }}>Đang làm</th>
                  <th style={{ textAlign: 'center' }}>Hoàn thành</th>
                  <th style={{ textAlign: 'center' }}>Tổng việc</th>
                </tr>
              </thead>
              <tbody>
                {statsList.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có dữ liệu phân công</td></tr>
                )}
                {statsList.map((stat) => (
                  <tr key={stat.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1e3a8a' }}>{stat.name}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{stat.chucVu}</div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{stat.chuaBatDau}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-orange">{stat.dangLam}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-green">{stat.hoanThanh}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                      {stat.tong}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Cảnh báo công việc quá hạn */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }}></span>
                Tác vụ cần đẩy nhanh tiến độ
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Danh sách cán bộ có công việc đã vượt mốc kế hoạch
              </div>
            </div>
            <span className="badge badge-red">
              {overdueTasks} quá hạn
            </span>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Cán bộ phụ trách</th>
                  <th style={{ textAlign: 'center' }}>Số việc trễ hạn</th>
                  <th style={{ textAlign: 'center' }}>Mức cảnh báo</th>
                </tr>
              </thead>
              <tbody>
                {statsList.filter(s => s.quaHan > 0).length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2.5rem', color: '#059669' }}>
                      ✓ Tuyệt vời! Hiện tại không có tác vụ nào bị quá hạn.
                    </td>
                  </tr>
                ) : (
                  statsList.filter(s => s.quaHan > 0).map((stat) => (
                    <tr key={stat.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{stat.name}</div>
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{stat.chucVu}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#dc2626' }}>
                        {stat.quaHan}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-red">Ưu tiên xử lý</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

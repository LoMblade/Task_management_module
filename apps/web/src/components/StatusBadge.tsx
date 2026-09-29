import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case 'CHUA_BAT_DAU': return { color: 'badge-gray', text: 'Chưa bắt đầu' };
      case 'DANG_LAM': return { color: 'badge-blue', text: 'Đang làm' };
      case 'CHO_DUYET': return { color: 'badge-orange', text: 'Chờ duyệt' };
      case 'HOAN_THANH': return { color: 'badge-green', text: 'Hoàn thành' };
      case 'DA_HUY': return { color: 'badge-red', text: 'Đã hủy' };
      default: return { color: 'badge-gray', text: s };
    }
  };

  const config = getStatusConfig(status);
  return <span className={`badge ${config.color}`}>{config.text}</span>;
}

import React from 'react';

export function PriorityBadge({ priority }: { priority: string }) {
  const getPriorityConfig = (p: string) => {
    switch (p) {
      case 'CAO': return { color: 'badge-red', text: 'Cao' };
      case 'TRUNG_BINH': return { color: 'badge-orange', text: 'Trung bình' };
      case 'THAP': return { color: 'badge-green', text: 'Thấp' };
      default: return { color: 'badge-gray', text: p };
    }
  };

  const config = getPriorityConfig(priority);
  return <span className={`badge ${config.color}`}>{config.text}</span>;
}

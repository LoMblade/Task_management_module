import React, { useState } from 'react';
import { useViecCon, useAddViecCon, useUpdateViecCon, useDeleteViecCon } from '../hooks';

export function SubtaskList({ congViecId }: { congViecId: string }) {
  const { data: response, isLoading } = useViecCon(congViecId);
  const addMutation = useAddViecCon();
  const updateMutation = useUpdateViecCon();
  const deleteMutation = useDeleteViecCon();
  
  const [newTitle, setNewTitle] = useState('');
  const viecCons = response?.data;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMutation.mutate({ id: congViecId, input: { ten: newTitle } }, {
      onSuccess: () => setNewTitle('')
    });
  };

  if (isLoading) return <div>Đang tải...</div>;
  
  const completed = viecCons?.filter((v: any) => v.daXong)?.length || 0;
  const total = viecCons?.length || 0;

  return (
    <div>
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
        Tiến độ: {completed}/{total} hoàn thành
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {viecCons?.map((vc: any) => (
          <li key={vc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={vc.daXong} 
              onChange={(e) => updateMutation.mutate({ congViecId, viecConId: vc.id, input: { daXong: e.target.checked } })}
            />
            <span style={{ textDecoration: vc.daXong ? 'line-through' : 'none', flex: 1 }}>{vc.ten}</span>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#c62828' }} 
              onClick={() => deleteMutation.mutate({ congViecId, viecConId: vc.id })}>
              Xóa
            </button>
          </li>
        ))}
      </ul>
      
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input 
          className="form-control" 
          placeholder="Thêm việc con..." 
          value={newTitle} 
          onChange={e => setNewTitle(e.target.value)} 
        />
        <button type="submit" className="btn btn-accent">Thêm</button>
      </form>
    </div>
  );
}

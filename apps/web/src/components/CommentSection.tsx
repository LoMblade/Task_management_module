import React, { useState } from 'react';
import { useBinhLuan, useAddBinhLuan } from '../hooks';
import { USERS } from '../auth';

function getUserName(id: string) {
  return USERS.find(u => u.id === id)?.ten || id;
}

export function CommentSection({ congViecId }: { congViecId: string }) {
  const { data: response, isLoading } = useBinhLuan(congViecId);
  const addMutation = useAddBinhLuan();
  const [content, setContent] = useState('');
  const comments = response?.data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addMutation.mutate({ id: congViecId, input: { noiDung: content } }, {
      onSuccess: () => setContent('')
    });
  };

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {comments?.map((bl: any) => (
          <div key={bl.id} style={{ backgroundColor: '#f9f9f9', padding: '0.75rem', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
              {getUserName(bl.nguoiTaoId)} - {new Date(bl.taoVao).toLocaleString('vi-VN')}
            </div>
            <div>{bl.noiDung}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea 
          className="form-control" 
          rows={3} 
          placeholder="Viết bình luận..." 
          value={content} 
          onChange={e => setContent(e.target.value)}
          style={{ marginBottom: '0.5rem' }}
        />
        <button type="submit" className="btn btn-accent">Gửi</button>
      </form>
    </div>
  );
}

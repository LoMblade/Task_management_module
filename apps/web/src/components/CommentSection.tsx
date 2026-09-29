import React, { useState } from 'react';
import { useBinhLuan, useAddBinhLuan, useNhanVien } from '../hooks';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

export function CommentSection({ congViecId }: { congViecId: string }) {
  const { data: nhanVienResponse } = useNhanVien();
  const nhanViens = nhanVienResponse?.data || [];
  
  function getUserName(id: string) {
    return nhanViens.find((u: any) => u.id === id)?.ten || id;
  }

  const { data: response, isLoading, error, refetch } = useBinhLuan(congViecId);
  const addMutation = useAddBinhLuan();
  const [content, setContent] = useState('');
  const comments = response?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addMutation.mutate({ id: congViecId, input: { noiDung: content } }, {
      onSuccess: () => setContent('')
    });
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {comments.length === 0 && <EmptyState message="Chưa có bình luận nào" />}
        {comments.map((bl: any) => (
          <div key={bl.id} style={{ backgroundColor: '#f9f9f9', padding: '0.75rem', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
              {getUserName(bl.userId)} - {new Date(bl.taoLuc).toLocaleString('vi-VN')}
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

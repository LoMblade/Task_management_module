import React, { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error';
type ToastMessage = { id: number; type: ToastType; title: string; message: string };

const ToastContext = createContext<{
  showToast: (type: ToastType, title: string, message: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
}>({ 
  showToast: () => {},
  success: () => {},
  error: () => {}
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastType, title: string, message: string = '') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (title: string, message?: string) => showToast('success', title, message || '');
  const error = (title: string, message?: string) => showToast('error', title, message || '');

  return (
    <ToastContext.Provider value={{ showToast, success, error }}>
      {children}
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            backgroundColor: toast.type === 'error' ? '#c62828' : '#2e7d32',
            color: 'white', padding: '16px', borderRadius: '4px', minWidth: '300px', maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', animation: 'slideIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', width: '24px', height: '24px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 'bold'
              }}>
                {toast.type === 'error' ? '✖' : '✔'}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>{toast.title}</strong>
                {toast.message && <span style={{ display: 'block', fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>{toast.message}</span>}
              </div>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0', marginLeft: '16px', fontSize: '1.2rem', opacity: 0.8 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';
type ToastMessage = { id: number; type: ToastType; title: string; message: string };

const ToastContext = createContext<{
  showToast: (type: ToastType, title: string, message: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}>({ 
  showToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {}
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
  const info = (title: string, message?: string) => showToast('info', title, message || '');

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            backgroundColor: toast.type === 'error' ? '#dc2626' : toast.type === 'info' ? '#2563eb' : '#059669',
            color: 'white', padding: '14px 18px', borderRadius: '8px', minWidth: '320px', maxWidth: '420px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', animation: 'slideIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', width: '26px', height: '26px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 'bold'
              }}>
                {toast.type === 'error' ? '✖' : toast.type === 'info' ? 'ℹ' : '✔'}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>{toast.title}</strong>
                {toast.message && <span style={{ display: 'block', fontSize: '0.825rem', opacity: 0.9, marginTop: '2px' }}>{toast.message}</span>}
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

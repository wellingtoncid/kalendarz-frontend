import React, { useEffect, useState, useContext, createContext } from 'react';
import { useTheme } from '../context/ThemeContext';

const ToastContext = createContext(null);

export function showToast(message, type = 'info', duration = 3000) {
  window.__toastCallback?.({ message, type, duration });
}

function ToastContainer() {
  const { theme } = useTheme();
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    window.__toastCallback = ({ message, type, duration }) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };
    
    return () => {
      window.__toastCallback = null;
    };
  }, []);
  
  const types = {
    success: { bg: theme.success, icon: '✓' },
    error: { bg: theme.error, icon: '✕' },
    warning: { bg: theme.warning, icon: '⚠' },
    info: { bg: theme.primary, icon: 'ℹ' },
  };
  
  const containerStyle = {
    position: 'fixed',
    top: '80px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 9999,
    maxWidth: '400px',
  };
  
  const toastStyle = (type) => ({
    padding: '14px 20px',
    borderRadius: '10px',
    backgroundColor: types[type]?.bg || theme.primary,
    color: 'white',
    fontWeight: '500',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.3s ease',
    wordBreak: 'break-word',
  });
  
  return (
    <div style={containerStyle}>
      {toasts.map(toast => (
        <div key={toast.id} style={toastStyle(toast.type)}>
          <span>{types[toast.type]?.icon || 'ℹ'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default ToastContainer;
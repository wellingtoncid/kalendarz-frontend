import React from 'react';
import { useTheme } from '../context/ThemeContext';

function Loader({ size = 'medium', text, fullScreen = false }) {
  const { theme } = useTheme();
  
  const sizes = {
    small: { width: '24px', borderWidth: '2px' },
    medium: { width: '40px', borderWidth: '3px' },
    large: { width: '60px', borderWidth: '4px' },
  };
  
  const containerStyle = fullScreen ? {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    gap: '16px',
    zIndex: 9999,
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '16px',
  };
  
  const spinnerStyle = {
    width: sizes[size].width,
    height: sizes[size].width,
    border: `${sizes[size].borderWidth} solid ${theme.border}`,
    borderTopColor: theme.primary,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };
  
  const textStyle = {
    color: theme.textSecondary,
    fontSize: '14px',
  };
  
  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {text && <span style={textStyle}>{text}</span>}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Loader;
import React from 'react';
import { useTheme } from '../context/ThemeContext';

function Card({ children, style, className, onClick, hoverable }) {
  const { theme } = useTheme();
  
  const cardStyle = {
    backgroundColor: theme.surface,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: hoverable ? 'all 0.2s ease' : 'none',
    cursor: onClick ? 'pointer' : 'default',
    border: `1px solid ${theme.border}`,
    ...style,
  };
  
  return (
    <div 
      style={cardStyle} 
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable && onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable && onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }
      }}
    >
      {children}
    </div>
  );
}

export default Card;
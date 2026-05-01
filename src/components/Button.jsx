import React from 'react';
import { useTheme } from '../context/ThemeContext';

function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick,
  type = 'button',
  disabled = false,
  style,
  className,
  fullWidth = false,
  icon
}) {
  const { theme } = useTheme();
  
  const variants = {
    primary: {
      backgroundColor: theme.primary,
      color: 'white',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.primary,
      border: `2px solid ${theme.primary}`,
    },
    danger: {
      backgroundColor: theme.error,
      color: 'white',
      border: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.textSecondary,
      border: 'none',
    },
    success: {
      backgroundColor: theme.success,
      color: 'white',
      border: 'none',
    },
  };
  
  const sizes = {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 20px', fontSize: '15px' },
    large: { padding: '14px 24px', fontSize: '16px' },
  };
  
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    ...variants[variant],
    ...sizes[size],
    ...style,
  };
  
  return (
    <button
      type={type}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
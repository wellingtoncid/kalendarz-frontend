import React from 'react';
import { useTheme } from '../context/ThemeContext';

function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  name,
  id,
  style,
  className
}) {
  const { theme } = useTheme();
  const inputId = id || name || label?.toLowerCase().replace(/\s/g, '-');
  
  const wrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    ...style,
  };
  
  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.text,
  };
  
  const requiredStyle = {
    color: theme.error,
    marginLeft: '2px',
  };
  
  const inputStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: error 
      ? `2px solid ${theme.error}` 
      : `1px solid ${theme.border}`,
    backgroundColor: disabled ? '#F1F5F9' : theme.surface,
    color: theme.text,
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
    width: '100%',
  };
  
  const errorStyle = {
    fontSize: '13px',
    color: theme.error,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };
  
  return (
    <div style={wrapperStyle} className={className}>
      {label && (
        <label style={labelStyle} htmlFor={inputId}>
          {label}
          {required && <span style={requiredStyle}>*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={inputStyle}
        onFocus={(e) => {
          e.target.style.borderColor = theme.primary;
          e.target.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? theme.error : theme.border;
          e.target.style.boxShadow = 'none';
        }}
      />
      
      {error && (
        <span style={errorStyle}>⚠️ {error}</span>
      )}
    </div>
  );
}

export default Input;
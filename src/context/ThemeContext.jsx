import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const themes = {
  blue: {
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    primaryDark: '#1D4ED8',
    secondary: '#9333EA',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E2E8F0',
    sidebarBg: '#1E293B',
    sidebarText: '#F1F5F9',
  },
  magenta: {
    primary: '#9333EA',
    primaryLight: '#A855F7',
    primaryDark: '#7E22CE',
    secondary: '#2563EB',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E2E8F0',
    sidebarBg: '#1E293B',
    sidebarText: '#F1F5F9',
  },
  green: {
    primary: '#059669',
    primaryLight: '#10B981',
    primaryDark: '#047857',
    secondary: '#9333EA',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E2E8F0',
    sidebarBg: '#1E293B',
    sidebarText: '#F1F5F9',
  },
};

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('blue');
  const [churchName, setChurchName] = useState('Minha Igreja');
  const [churchLogo, setChurchLogo] = useState(null);
  
  const theme = themes[themeName] || themes.blue;
  
  const updateTheme = (name) => {
    if (themes[name]) {
      setThemeName(name);
    }
  };
  
  const updateChurch = (name, logo = null) => {
    setChurchName(name);
    if (logo !== undefined) {
      setChurchLogo(logo);
    }
  };
  
  return (
    <ThemeContext.Provider value={{
      theme,
      themeName,
      updateTheme,
      churchName,
      churchLogo,
      updateChurch,
      themes: Object.keys(themes)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
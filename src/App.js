import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Volunteers from './pages/Volunteers';
import Shifts from './pages/Shifts';
import Ministries from './pages/Ministries';
import Availability from './pages/Availability';
import GenerateSchedule from './pages/GenerateSchedule';
import ConfirmSchedule from './pages/ConfirmSchedule';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { menuItems } from './config/menu';

function AppLayout({ children }) {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: theme.background, minHeight: '100vh' }}>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
        backgroundColor: theme.surface, borderBottom: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setMenuOpen(true)} style={{
            background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px'
          }}>☰</button>
          <span style={{ fontSize: '18px', fontWeight: '700', color: theme.text }}>Kalendarz</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>🔔</button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99
          }} />
          <nav style={{
            position: 'fixed', top: 0, left: 0, width: '260px', height: '100vh',
            backgroundColor: '#1E293B', zIndex: 100, padding: '20px', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Menu</span>
            </div>
            {menuItems.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setMenuOpen(false)} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                backgroundColor: isActive ? theme.primary : 'transparent',
                textDecoration: 'none', borderRadius: '8px', marginBottom: '4px',
                fontWeight: isActive ? '600' : '400',
              })}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </>
      )}

      <main style={{ 
        paddingTop: '84px', 
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ minHeight: 'calc(100vh - 132px)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  // Service worker desativado durante desenvolvimento
  // if ('serviceWorker' in navigator) {
  //   window.addEventListener('load', () => {
  //     navigator.serviceWorker.register('/service-worker.js')
  //       .then(reg => console.log('SW registered:', reg))
  //       .catch(err => console.log('SW failed:', err));
  //   });
  // }

  return (
    <ThemeProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/ministries" element={<Ministries />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/generate" element={<GenerateSchedule />} />
          <Route path="/confirm" element={<ConfirmSchedule />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;
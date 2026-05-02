import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Areas from './pages/Areas';
import Positions from './pages/Positions';
import Shifts from './pages/Shifts';
import Ministries from './pages/Ministries';
import Availability from './pages/Availability';
import GenerateSchedule from './pages/GenerateSchedule';
import PublishedSchedules from './pages/ConfirmSchedule';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AvailabilityRequests from './pages/AvailabilityRequests';
import AvailabilityResponse from './pages/AvailabilityResponse';

const menuItems = [
  { path: '/', icon: '📊', label: 'Dashboard', exact: true },
  { path: '/users', icon: '👥', label: 'Usuários', requiredRole: 'coordinator' },
  { path: '/ministries', icon: '⛪', label: 'Ministérios', requiredRole: 'coordinator' },
  { path: '/areas', icon: '📍', label: 'Áreas', requiredRole: 'coordinator' },
  { path: '/positions', icon: '🎯', label: 'Funções', requiredRole: 'coordinator' },
  { path: '/shifts', icon: '🕐', label: 'Eventos', requiredRole: 'coordinator' },
  { path: '/availability', icon: '📅', label: 'Disponibilidade' },
  { path: '/availability-requests', icon: '📨', label: 'Solicitações', requiredRole: 'coordinator' },
  { path: '/generate', icon: '⚡', label: 'Gerar Escala', requiredRole: 'coordinator' },
  { path: '/confirm', icon: '📋', label: 'Escala Publicada' },
  { path: '/reports', icon: '📈', label: 'Relatórios', requiredRole: 'coordinator' },
  { path: '/settings', icon: '⚙️', label: 'Configurações' },
];

function AppLayout({ children }) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {user?.name} • <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </span>
          <button onClick={logout} style={{
            background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'
          }}>🚪</button>
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
            {menuItems.filter(item => {
              if (!item.requiredRole) return true;
              const roles = { admin: 4, coordinator: 3, ministry_leader: 2, area_leader: 1, volunteer: 0 };
              return (roles[user?.role] || 0) >= (roles[item.requiredRole] || 0);
            }).map((item) => (
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
        padding: '100px 24px 24px',
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

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Rotas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute requiredRole="coordinator">
          <AppLayout><Users /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/ministries" element={
        <ProtectedRoute requiredRole="coordinator">
          <AppLayout><Ministries /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/areas" element={
        <ProtectedRoute requiredRole="coordinator">
          <AppLayout><Areas /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/positions" element={
        <ProtectedRoute requiredRole="coordinator">
          <AppLayout><Positions /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/shifts" element={
        <ProtectedRoute requiredRole="coordinator">
          <AppLayout><Shifts /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/availability" element={
        <ProtectedRoute>
          <AppLayout><Availability /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/availability-requests" element={
        <ProtectedRoute requiredRole="coordinator">
          <AppLayout><AvailabilityRequests /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/availability/:token" element={<AvailabilityResponse />} />
      <Route path="/generate" element={
        <ProtectedRoute requiredRole="coordinator">
          <AppLayout><GenerateSchedule /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/confirm" element={
        <ProtectedRoute>
          <AppLayout><PublishedSchedules /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute requiredRole="coordinator">
          <AppLayout><Reports /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout><Settings /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Redirecionar rotas desconhecidas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
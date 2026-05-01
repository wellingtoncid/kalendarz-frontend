import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ministries: 0,
    volunteers: 0,
    schedulesThisMonth: 0,
    pendingConfirmations: 0
  });
  const [recentSchedules, setRecentSchedules] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [minRes, volRes, schRes, assignRes, reportRes] = await Promise.all([
        api.get('/ministries'),
        api.get('/volunteers'),
        api.get('/schedules'),
        api.get('/assignments?status=pending'),
        api.get('/reports')
      ]);

      const schedules = schRes.data || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisMonthSchedules = schedules.filter(s => {
        const sDate = new Date(s.event_date);
        return sDate >= startOfMonth;
      });

      const reportData = reportRes.data?.data || {};
      
      setStats({
        ministries: minRes.data?.length || 0,
        volunteers: volRes.data?.length || 0,
        schedulesThisMonth: thisMonthSchedules.length,
        pendingConfirmations: assignRes.data?.length || reportData.pending || 0
      });

      const sorted = [...schedules].sort((a, b) => 
        new Date(b.event_date) - new Date(a.event_date)
      ).slice(0, 5);
      setRecentSchedules(sorted);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set default values on error
      setStats({
        ministries: 0,
        volunteers: 0,
        schedulesThisMonth: 0,
        pendingConfirmations: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (schedule) => {
    if (schedule.start_date && schedule.end_date && schedule.start_date !== schedule.end_date) {
      const startDate = new Date(schedule.start_date);
      const endDate = new Date(schedule.end_date);
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return `${startDate.toLocaleDateString('pt-BR', options)} - ${endDate.toLocaleDateString('pt-BR', options)}`;
    }
    const date = new Date(schedule.event_date || schedule.start_date);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Rascunho', class: 'badge-warning' },
      confirmed: { label: 'Confirmada', class: 'badge-success' },
      published: { label: 'Publicada', class: 'badge-success' },
      cancelled: { label: 'Cancelada', class: 'badge-error' }
    };
    const config = statusConfig[status] || { label: status || 'Rascunho', class: 'badge-warning' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const quickActions = [
    { 
      label: 'Novo Ministério', 
      icon: '⛪', 
      path: '/ministries',
      action: () => navigate('/ministries')
    },
    { 
      label: 'Novo Voluntário', 
      icon: '👤', 
      path: '/volunteers',
      action: () => navigate('/volunteers')
    },
    { 
      label: 'Nova Escala', 
      icon: '📅', 
      path: '/generate',
      action: () => navigate('/generate')
    },
    { 
      label: 'Coletar Disponibilidade', 
      icon: '📱', 
      path: '/availability',
      action: () => navigate('/availability')
    }
  ];

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ marginBottom: '8px' }}>Bem-vindo!</h1>
        <p style={{ color: theme.textSecondary, fontSize: '16px', margin: 0 }}>
          Gerencie suas escalas e ministérios
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <Card hoverable onClick={() => navigate('/ministries')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '14px', 
              backgroundColor: '#8B5CF620', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontSize: '24px' 
            }}>⛪</div>
            <div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>Ministérios</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: theme.text }}>{stats.ministries}</div>
            </div>
          </div>
        </Card>

        <Card hoverable onClick={() => navigate('/volunteers')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '14px', 
              backgroundColor: '#3B82F620', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontSize: '24px' 
            }}>👥</div>
            <div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>Voluntários</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: theme.text }}>{stats.volunteers}</div>
            </div>
          </div>
        </Card>

        <Card hoverable onClick={() => navigate('/reports')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '14px', 
              backgroundColor: '#10B98120', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontSize: '24px' 
            }}>📋</div>
            <div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>Escalas (mês)</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: theme.text }}>{stats.schedulesThisMonth}</div>
            </div>
          </div>
        </Card>

        <Card hoverable onClick={() => navigate('/confirm')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '14px', 
              backgroundColor: '#F59E0B20', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontSize: '24px' 
            }}>⏳</div>
            <div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>Confirmações</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: theme.text }}>{stats.pendingConfirmations}</div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: theme.text, marginBottom: '16px' }}>
          Ações Rápidas
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px' 
        }}>
          {quickActions.map((action, idx) => (
            <Card 
              key={idx} 
              hoverable 
              onClick={action.action}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{action.icon}</span>
                <span style={{ fontWeight: '500', color: theme.text }}>{action.label}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: theme.text, margin: 0 }}>
            Escalas Recentes
          </h2>
          <Link to="/reports" style={{ color: theme.primary, textDecoration: 'none', fontSize: '14px' }}>
            Ver todas →
          </Link>
        </div>
        
        {recentSchedules.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px', color: theme.textSecondary }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
              <p>Nenhuma escala encontrada</p>
              <Button onClick={() => navigate('/generate')} style={{ marginTop: '12px' }}>
                Criar Primeira Escala
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentSchedules.map((schedule) => (
              <Card key={schedule.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: theme.text }}>
                      {schedule.name || `Escala #${schedule.id}`}
                    </div>
                    <div style={{ fontSize: '14px', color: theme.textSecondary, marginTop: '4px' }}>
                      {formatDateRange(schedule)}
                    </div>
                  </div>
                  {getStatusBadge(schedule.status)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
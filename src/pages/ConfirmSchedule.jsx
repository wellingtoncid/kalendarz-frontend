import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function PublishedSchedules() {
  const { theme } = useTheme();
  const [scheduleGroups, setScheduleGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) fetchAssignments();
  }, [selectedGroup, filter]);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/schedule-groups');
      const confirmed = (res.data || []).filter(g => g.status === 'confirmed');
      setScheduleGroups(confirmed);
      if (confirmed.length > 0) setSelectedGroup(confirmed[0].id);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const status = filter === 'all' ? '' : filter;
      const res = await api.get(`/assignments?schedule_group_id=${selectedGroup}&status=${status}`);
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Carregando...</div>;

  const groupedByDate = assignments.reduce((acc, a) => {
    const date = a.event_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(a);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">📋 Escala Publicada</h1>
      </div>

      {scheduleGroups.length === 0 ? (
        <Card><div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>Nenhuma escala publicada ainda. Gere e confirme uma escala primeiro.</div></Card>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '4px' }}>Escala</label>
              <select className="form-input" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                {scheduleGroups.map(g => <option key={g.id} value={g.id}>{g.name} — {g.ministry_name}{g.area_name ? ` / ${g.area_name}` : ''}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              {['all', 'pending', 'confirmed'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '10px 20px', borderRadius: '8px',
                  border: filter === f ? 'none' : `2px solid ${theme.border}`,
                  backgroundColor: filter === f ? theme.primary : 'white',
                  color: filter === f ? 'white' : theme.text, cursor: 'pointer', fontWeight: filter === f ? '600' : '400'
                }}>
                  {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : 'Confirmados'}
                </button>
              ))}
            </div>
          </div>

          {Object.keys(groupedByDate).length === 0 ? (
            <Card><div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>Nenhuma atribuição encontrada</div></Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(groupedByDate).sort().map(([date, items]) => (
                <Card key={date}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: theme.primary }}>{date}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.sort((a, b) => (a.event_time || '').localeCompare(b.event_time || '')).map((a) => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{a.user_name || a.volunteer_name}</div>
                          <div style={{ fontSize: '14px', color: theme.textSecondary }}>{a.event_title} • {a.event_time?.slice(0, 5)}</div>
                          {a.role_name && <div style={{ fontSize: '13px', color: theme.primary, marginTop: '2px' }}>{a.role_name}</div>}
                        </div>
                        <span className={`badge ${a.status === 'confirmed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-error' : 'badge-warning'}`}>
                          {a.status === 'confirmed' ? 'Confirmado' : a.status === 'cancelled' ? 'Rejeitado' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PublishedSchedules;

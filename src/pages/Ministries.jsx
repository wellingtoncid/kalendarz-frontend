import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function Ministries() {
  const { theme } = useTheme();
  const [ministries, setMinistries] = useState([]);
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#2563EB', leader_id: '' });
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [minRes, areasRes, usersRes] = await Promise.all([
        api.get('/ministries'),
        api.get('/areas'),
        api.get('/users')
      ]);
      setMinistries(minRes.data || []);
      setAreas(areasRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', color: '#2563EB', leader_id: '' });
    setSelectedAreaIds([]);
    setShowForm(true);
  };

  const openEdit = (ministry) => {
    setEditing(ministry.id);
    setForm({
      name: ministry.name,
      description: ministry.description || '',
      color: ministry.color || '#2563EB',
      leader_id: ministry.leader_id || ''
    });
    setSelectedAreaIds(getMinistryAreas(ministry.id).map(a => a.id));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      let ministryId = editing;
      const payload = {
        name: form.name,
        description: form.description,
        color: form.color,
        leader_id: form.leader_id || null
      };

      if (editing) {
        await api.put(`/ministries/${editing}`, payload);
        ministryId = editing;
      } else {
        const res = await api.post('/ministries', payload);
        ministryId = res.data.id;
      }

      const areasToUnassign = areas.filter(a => a.ministry_id === ministryId && !selectedAreaIds.includes(a.id));
      const areasToAssign = areas.filter(a => selectedAreaIds.includes(a.id) && a.ministry_id !== ministryId);

      for (const area of areasToUnassign) {
        await api.put(`/areas/${area.id}`, { ...area, ministry_id: null });
      }
      for (const area of areasToAssign) {
        await api.put(`/areas/${area.id}`, { ...area, ministry_id: ministryId });
      }

      setShowForm(false);
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error('Error saving:', err);
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este ministério?')) return;
    try {
      await api.delete(`/ministries/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting ministry:', err);
    }
  };

  const toggleArea = (id) => {
    setSelectedAreaIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const getMinistryAreas = (ministryId) => areas.filter(a => a.ministry_id === ministryId);

  const getLeaderName = (leaderId) => {
    if (!leaderId) return 'Sem líder definido';
    const user = users.find(u => u.id == leaderId);
    return user ? user.name : 'Sem líder definido';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">⛪ Ministérios</h1>
        <Button onClick={openCreate}>+ Novo Ministério</Button>
      </div>

      {ministries.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>Nenhum ministério encontrado</p>
          </div>
        </Card>
      ) : (
        <div className="cards-grid">
          {ministries.map((ministry) => {
            const ministryAreas = getMinistryAreas(ministry.id);
            return (
              <Card key={ministry.id} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: ministry.color || theme.primary }} />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.text }}>{ministry.name}</h3>
                </div>
                {ministry.description && (
                  <p style={{ margin: 0, color: theme.textSecondary, fontSize: '14px', marginBottom: '8px' }}>{ministry.description}</p>
                )}
                <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '8px' }}>
                  👤 Líder: <span style={{ fontWeight: '500', color: theme.text }}>{getLeaderName(ministry.leader_id)}</span>
                </div>
                {ministryAreas.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '500' }}>{ministryAreas.length} área(s): </span>
                    {ministryAreas.map(a => (
                      <span key={a.id} style={{ fontSize: '13px', color: theme.primary, marginRight: '6px' }}>{a.name}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="small" variant="ghost" onClick={() => openEdit(ministry)}>✏️ Editar</Button>
                  <Button size="small" variant="ghost" onClick={() => handleDelete(ministry.id)}>🗑️</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Editar Ministério' : 'Novo Ministério'} footer={<>
        <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
        <Button onClick={handleSave}>{editing ? 'Salvar' : 'Criar'}</Button>
      </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '6px' }}>Cor</label>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ width: '60px', height: '40px', border: 'none', cursor: 'pointer' }} />
          </div>
          <div>
            <label className="form-label">Líder do Ministério</label>
            <select className="form-input" value={form.leader_id} onChange={(e) => setForm({ ...form, leader_id: e.target.value })}>
              <option value="">Selecione o líder</option>
              {users.filter(u => u.role === 'ministry_leader' || u.role === 'admin' || u.role === 'coordinator').map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {editing && (
            <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: theme.text }}>📍 Áreas deste Ministério ({selectedAreaIds.length})</h4>
              <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0 }}>Marque as áreas que pertencem a este ministério.</p>

              {areas.length === 0 && (
                <div style={{ textAlign: 'center', padding: '12px', color: theme.textSecondary, fontSize: '14px' }}>Nenhuma área cadastrada. Cadastre áreas na página "Áreas" primeiro.</div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {areas.map(area => (
                  <label key={area.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: selectedAreaIds.includes(area.id) ? theme.primary + '15' : '#F8FAFC', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedAreaIds.includes(area.id)} onChange={() => toggleArea(area.id)} style={{ accentColor: theme.primary }} />
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>{area.name}</span>
                    {area.ministry_id === ministry.id && (
                      <span className="badge badge-info" style={{ fontSize: '11px' }}>Atual</span>
                    )}
                    {area.ministry_id && area.ministry_id !== ministry.id && (
                      <span style={{ fontSize: '12px', color: theme.textSecondary }}>→ de {ministries.find(m => m.id === area.ministry_id)?.name || '?'}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Ministries;

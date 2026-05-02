import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

function Areas() {
  const { theme } = useTheme();
  const [areas, setAreas] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', ministry_id: '', leader_id: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [areasRes, minRes, usersRes] = await Promise.all([
        api.get('/areas'),
        api.get('/ministries'),
        api.get('/users')
      ]);
      setAreas(areasRes.data || []);
      setMinistries(minRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, leader_id: form.leader_id || null };
      if (editing) {
        await api.put(`/areas/${editing.id}`, payload);
      } else {
        await api.post('/areas', payload);
      }
      setForm({ name: '', ministry_id: '', leader_id: '', description: '' });
      setShowForm(false);
      setEditing(null);
      loadData();
    } catch (error) {
      console.error('Error saving area:', error);
      alert('Erro ao salvar área');
    }
  };

  const handleEdit = (area) => {
    setForm({ name: area.name, ministry_id: area.ministry_id, leader_id: area.leader_id || '', description: area.description || '' });
    setEditing(area);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta área?')) return;
    try {
      await api.delete(`/areas/${id}`);
      loadData();
    } catch (error) {
      console.error('Error deleting area:', error);
    }
  };

  const openNewForm = () => {
    setForm({ name: '', ministry_id: '', leader_id: '', description: '' });
    setEditing(null);
    setShowForm(true);
  };

  const formFooter = (
    <>
      <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
      <Button onClick={handleSubmit} icon="💾">{editing ? 'Salvar' : 'Criar'}</Button>
    </>
  );

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Carregando...</div>;
  }

  // Group by ministry
  const grouped = {};
  areas.forEach(a => {
    const min = a.ministry_name || 'Sem ministério';
    if (!grouped[min]) grouped[min] = [];
    grouped[min].push(a);
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">📍 Áreas</h1>
        <Button onClick={openNewForm}>+ Nova Área</Button>
      </div>

      {areas.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>Nenhuma área cadastrada</p>
            <Button onClick={openNewForm} icon="➕">Criar Primeira Área</Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(grouped).map(([ministryName, ministryAreas]) => (
            <div key={ministryName}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ministryName}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {ministryAreas.map(area => (
                  <Card key={area.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}>{area.name}</div>
                        {area.description && <div style={{ fontSize: '14px', color: theme.textSecondary, marginTop: '4px' }}>{area.description}</div>}
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', backgroundColor: area.active ? '#10B98120' : '#EF444420', color: area.active ? '#10B981' : '#EF4444', fontWeight: '500' }}>{area.active ? 'Ativa' : 'Inativa'}</span>
                    </div>
                    {area.leader_name && <div style={{ fontSize: '14px', color: theme.textSecondary }}>👤 Líder: {area.leader_name}</div>}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${theme.border}` }}>
                      <Button variant="ghost" size="small" onClick={() => handleEdit(area)}>✏️ Editar</Button>
                      <Button variant="ghost" size="small" onClick={() => handleDelete(area.id)}>🗑️</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Editar Área' : 'Nova Área'} footer={formFooter}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Projeção, Som, Live Stream" required />
          
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Ministério</label>
            <select value={form.ministry_id} onChange={(e) => setForm({ ...form, ministry_id: e.target.value })} style={{ width: '100%', padding: '12px', border: `2px solid ${theme.border}`, borderRadius: '8px', fontSize: '14px', backgroundColor: theme.surface, color: theme.text }} required>
              <option value="">Selecione um ministério</option>
              {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Líder da Área (opcional)</label>
            <select value={form.leader_id} onChange={(e) => setForm({ ...form, leader_id: e.target.value })} style={{ width: '100%', padding: '12px', border: `2px solid ${theme.border}`, borderRadius: '8px', fontSize: '14px', backgroundColor: theme.surface, color: theme.text }}>
              <option value="">Sem líder definido</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          
          <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição da área..." multiline />
        </div>
      </Modal>
    </div>
  );
}

export default Areas;

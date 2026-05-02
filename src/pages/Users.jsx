import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'coordinator', label: 'Coordenador' },
  { value: 'ministry_leader', label: 'Líder de Ministério' },
  { value: 'area_leader', label: 'Líder de Área' },
  { value: 'volunteer', label: 'Membro' },
];

function Users() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [areas, setAreas] = useState([]);
  const [positions, setPositions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'volunteer',
    ministry_id: '', area_id: '', position_ids: [], skills: '', notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, minRes, areasRes, posRes] = await Promise.all([
        api.get('/users'), api.get('/ministries'), api.get('/areas'), api.get('/positions')
      ]);
      setUsers(userRes.data || []);
      setMinistries(minRes.data || []);
      setAreas(areasRes.data || []);
      setPositions(posRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name, email: form.email || null, phone: form.phone || null,
        role: form.role, skills: form.skills || null, notes: form.notes || null,
        ministry_id: form.ministry_id || null, area_id: form.area_id || null,
        position_ids: form.position_ids
      };
      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao salvar usuário');
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name, email: user.email || '', phone: user.phone || '',
      role: user.role || 'volunteer', ministry_id: user.ministry_id || '',
      area_id: user.area_id || '', position_ids: [],
      skills: user.skills || '', notes: user.notes || ''
    });
    setEditing(user);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este usuário?')) return;
    try { await api.delete(`/users/${id}`); loadData(); } catch (error) { console.error('Error:', error); }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', role: 'volunteer', ministry_id: '', area_id: '', position_ids: [], skills: '', notes: '' });
    setEditing(null);
    setShowForm(false);
  };

  const togglePosition = (id) => {
    setForm(prev => ({
      ...prev, position_ids: prev.position_ids.includes(id) ? prev.position_ids.filter(p => p !== id) : [...prev.position_ids, id]
    }));
  };

  const filteredAreas = areas.filter(a => !form.ministry_id || a.ministry_id == form.ministry_id);
  const filteredPositions = positions.filter(p => !form.area_id || p.area_id == form.area_id);
  const roleLabel = (r) => roleOptions.find(x => x.value === r)?.label || r;
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Carregando...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">👥 Usuários</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Novo Usuário</Button>
      </div>

      {users.length === 0 ? (
        <Card><div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}><p style={{ fontSize: '18px', marginBottom: '16px' }}>Nenhum usuário cadastrado</p></div></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {users.map(user => (
            <Card key={user.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'white', fontWeight: '600' }}>{getInitials(user.name)}</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>{user.name}</div>
                  <div style={{ fontSize: '13px', color: theme.textSecondary }}>{user.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', backgroundColor: theme.primary + '20', color: theme.primary, fontWeight: '500' }}>{roleLabel(user.role)}</span>
                {user.ministry_names && user.ministry_names.split(',').map((name, idx) => (
                  <span key={idx} style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', backgroundColor: '#10B98120', color: '#10B981', fontWeight: '500' }}>{name.trim()}</span>
                ))}
              </div>
              {user.phone && <div style={{ fontSize: '13px', color: theme.textSecondary }}>📱 {user.phone}</div>}
              {user.skills && <div style={{ fontSize: '13px', color: theme.textSecondary }}>🎯 {user.skills}</div>}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${theme.border}` }}>
                <Button variant="ghost" size="small" onClick={() => handleEdit(user)}>✏️ Editar</Button>
                <Button variant="ghost" size="small" onClick={() => handleDelete(user.id)}>🗑️</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={resetForm} title={editing ? 'Editar Usuário' : 'Novo Usuário'} footer={<>
        <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
        <Button onClick={handleSubmit} icon="💾">{editing ? 'Salvar' : 'Criar'}</Button>
      </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            <Input label="WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Função no Sistema</label>
            <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Ministério</label>
              <select className="form-input" value={form.ministry_id} onChange={(e) => setForm({ ...form, ministry_id: e.target.value, area_id: '' })}>
                <option value="">Selecione...</option>
                {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Área</label>
              <select className="form-input" value={form.area_id} onChange={(e) => setForm({ ...form, area_id: e.target.value })} disabled={!form.ministry_id}>
                <option value="">Selecione...</option>
                {filteredAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          {form.area_id && (
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Funções / Posições</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {filteredPositions.map(p => (
                  <button key={p.id} type="button" onClick={() => togglePosition(p.id)} style={{
                    padding: '6px 14px', borderRadius: '16px',
                    border: form.position_ids.includes(p.id) ? 'none' : `2px solid ${theme.border}`,
                    backgroundColor: form.position_ids.includes(p.id) ? theme.primary : 'transparent',
                    color: form.position_ids.includes(p.id) ? 'white' : theme.text,
                    cursor: 'pointer', fontSize: '13px'
                  }}>{p.name}</button>
                ))}
                {filteredPositions.length === 0 && <span style={{ fontSize: '13px', color: theme.textSecondary }}>Nenhuma posição nesta área</span>}
              </div>
            </div>
          )}

          <Input label="Habilidades" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Ex: Projeção, Som, Live Stream" />
          <Input label="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas..." />
        </div>
      </Modal>
    </div>
  );
}

export default Users;

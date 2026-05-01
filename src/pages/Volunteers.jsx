import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

function Volunteers() {
  const { theme } = useTheme();
  const [volunteers, setVolunteers] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', ministry_ids: [], skills: '', notes: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [volRes, minRes] = await Promise.all([
        api.get('/volunteers'),
        api.get('/ministries')
      ]);
      setVolunteers(volRes.data || []);
      setMinistries(minRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        ministry_id: form.ministry_ids[0] || null
      };
      
      if (editing) {
        await api.put(`/volunteers/${editing.id}`, payload);
      } else {
        await api.post('/volunteers', payload);
      }
      
      setForm({ name: '', email: '', phone: '', ministry_ids: [], skills: '', notes: '' });
      setShowForm(false);
      setEditing(null);
      loadData();
    } catch (error) {
      console.error('Error saving volunteer:', error);
      alert('Erro ao salvar voluntário');
    }
  };

  const handleEdit = (volunteer) => {
    const ministryIds = volunteer.ministry_ids ? volunteer.ministry_ids.split(',').map(Number) : [];
    setForm({ 
      name: volunteer.name, 
      email: volunteer.email || '', 
      phone: volunteer.phone || '', 
      ministry_ids: ministryIds,
      skills: volunteer.skills || '', 
      notes: volunteer.notes || '' 
    });
    setEditing(volunteer);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este voluntário?')) return;
    try {
      await api.delete(`/volunteers/${id}`);
      loadData();
    } catch (error) {
      console.error('Error deleting volunteer:', error);
    }
  };

  const toggleMinistry = (id) => {
    setForm(prev => ({
      ...prev,
      ministry_ids: prev.ministry_ids.includes(id)
        ? prev.ministry_ids.filter(m => m !== id)
        : [...prev.ministry_ids, id]
    }));
  };

  const openNewForm = () => {
    setForm({ name: '', email: '', phone: '', ministry_ids: [], skills: '', notes: '' });
    setEditing(null);
    setShowForm(true);
  };

  const formFooter = (
    <>
      <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
      <Button onClick={handleSubmit} icon="💾">{editing ? 'Salvar' : 'Adicionar'}</Button>
    </>
  );

  const pageStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.text,
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  };

  const volunteerCardStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
  };

  const avatarStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    backgroundColor: theme.primaryLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: 'white',
    fontWeight: '600',
  };

  const nameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.text,
  };

  const infoStyle = {
    fontSize: '14px',
    color: theme.textSecondary,
  };

  const tagsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
  };

  const tagStyle = (color) => ({
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    backgroundColor: color + '20',
    color: color,
    fontWeight: '500',
  });

  const actionsStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.border}`,
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Carregando...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 className="page-title">👥 Voluntarios</h1>
        <Button onClick={openNewForm}>+ Novo Voluntario</Button>
      </div>

      {volunteers.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>Nenhum voluntário cadastrado</p>
            <Button onClick={openNewForm} icon="➕">Adicionar Primeiro Voluntário</Button>
          </div>
        </Card>
      ) : (
        <div style={gridStyle}>
          {volunteers.map(volunteer => (
            <Card key={volunteer.id} style={volunteerCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={avatarStyle}>{getInitials(volunteer.name)}</div>
                <div>
                  <div style={nameStyle}>{volunteer.name}</div>
                  {volunteer.email && <div style={infoStyle}>{volunteer.email}</div>}
                </div>
              </div>
              
              {volunteer.phone && (
                <div style={infoStyle}>📱 {volunteer.phone}</div>
              )}
              
              {volunteer.skills && (
                <div style={infoStyle}>🎯 {volunteer.skills}</div>
              )}
              
              {volunteer.ministry_names && (
                <div style={tagsStyle}>
                  {volunteer.ministry_names.split(',').map((name, idx) => (
                    <span key={idx} style={tagStyle(theme.primary)}>{name.trim()}</span>
                  ))}
                </div>
              )}
              
              <div style={actionsStyle}>
                <Button variant="ghost" size="small" onClick={() => handleEdit(volunteer)}>✏️ Editar</Button>
                <Button variant="ghost" size="small" onClick={() => handleDelete(volunteer.id)}>🗑️</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Editar Voluntário' : 'Novo Voluntário'}
        footer={formFooter}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nome completo"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@exemplo.com"
          />
          <Input
            label="WhatsApp"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+55 11 99999-9999"
          />
          
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>
              Ministérios
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ministries.map(min => (
                <button
                  key={min.id}
                  type="button"
                  onClick={() => toggleMinistry(min.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: form.ministry_ids.includes(min.id) ? 'none' : `2px solid ${theme.border}`,
                    backgroundColor: form.ministry_ids.includes(min.id) ? theme.primary : 'transparent',
                    color: form.ministry_ids.includes(min.id) ? 'white' : theme.text,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {min.name}
                </button>
              ))}
            </div>
          </div>
          
          <Input
            label="Habilidades"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="Ex: Violão, Baixo, Vocal"
          />
          <Input
            label="Observações"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notas sobre o voluntário..."
          />
        </div>
      </Modal>
    </div>
  );
}

export default Volunteers;
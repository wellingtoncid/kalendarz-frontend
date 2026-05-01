import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function Ministries() {
  const { theme } = useTheme();
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#2563EB' });

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    try {
      const res = await api.get('/ministries');
      setMinistries(res.data || []);
    } catch (err) {
      console.error('Error fetching ministries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/ministries/${editing}`, form);
      } else {
        await api.post('/ministries', form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', description: '', color: '#2563EB' });
      fetchMinistries();
    } catch (err) {
      console.error('Error saving ministry:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este ministério?')) return;
    try {
      await api.delete(`/ministries/${id}`);
      fetchMinistries();
    } catch (err) {
      console.error('Error deleting ministry:', err);
    }
  };

  const openEdit = (ministry) => {
    setEditing(ministry.id);
    setForm({ name: ministry.name, description: ministry.description || '', color: ministry.color || '#2563EB' });
    setShowModal(true);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Ministérios</h1>
        <Button onClick={() => { setEditing(null); setForm({ name: '', description: '', color: '#2563EB' }); setShowModal(true); }}>
          + Novo Ministério
        </Button>
      </div>

      {ministries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⛪</div>
          <div className="empty-state-title">Nenhum ministério encontrado</div>
          <div className="empty-state-text">Crie seu primeiro ministério para começar</div>
        </div>
      ) : (
        <div className="cards-grid">
          {ministries.map((ministry) => (
            <Card key={ministry.id} hoverable onClick={() => openEdit(ministry)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  backgroundColor: ministry.color || theme.primary
                }} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.text }}>
                  {ministry.name}
                </h3>
              </div>
              <p style={{ margin: 0, color: theme.textSecondary, fontSize: '14px' }}>
                {ministry.description || 'Sem descrição'}
              </p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <Button size="small" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(ministry); }}>
                  Editar
                </Button>
                <Button size="small" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(ministry.id); }}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Ministério' : 'Novo Ministério'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: theme.text }}>
              Cor
            </label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              style={{ width: '60px', height: '40px', border: 'none', cursor: 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button onClick={handleSave}>{editing ? 'Salvar' : 'Criar'}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Ministries;
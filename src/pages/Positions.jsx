import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

function Positions() {
  const { theme } = useTheme();
  const [positions, setPositions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', area_id: '', max_people: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [posRes, areasRes] = await Promise.all([
        api.get('/positions'),
        api.get('/areas')
      ]);
      setPositions(posRes.data || []);
      setAreas(areasRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/positions/${editing.id}`, { ...form, max_people: parseInt(form.max_people) || 1 });
      } else {
        await api.post('/positions', { ...form, max_people: parseInt(form.max_people) || 1 });
      }
      setForm({ name: '', area_id: '', max_people: 1 });
      setShowForm(false);
      setEditing(null);
      loadData();
    } catch (error) {
      console.error('Error saving position:', error);
      alert('Erro ao salvar função');
    }
  };

  const handleEdit = (position) => {
    setForm({ name: position.name, area_id: position.area_id, max_people: position.max_people || 1 });
    setEditing(position);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta função?')) return;
    try {
      await api.delete(`/positions/${id}`);
      loadData();
    } catch (error) {
      console.error('Error deleting position:', error);
    }
  };

  const openNewForm = () => {
    setForm({ name: '', area_id: '', max_people: 1 });
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

  // Group by area
  const grouped = {};
  positions.forEach(p => {
    const area = p.area_name || 'Sem área';
    if (!grouped[area]) grouped[area] = [];
    grouped[area].push(p);
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">🎯 Funções</h1>
        <Button onClick={openNewForm}>+ Nova Função</Button>
      </div>

      {positions.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>Nenhuma função cadastrada</p>
            <Button onClick={openNewForm} icon="➕">Criar Primeira Função</Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(grouped).map(([areaName, areaPositions]) => (
            <div key={areaName}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{areaName} {areaPositions[0]?.ministry_name && <span style={{ fontWeight: '400', fontSize: '14px' }}>({areaPositions[0].ministry_name})</span>}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {areaPositions.map(pos => (
                  <Card key={pos.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: theme.text }}>{pos.name}</div>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', backgroundColor: theme.primary + '20', color: theme.primary, fontWeight: '500' }}>{pos.max_people || 1} pessoa(s)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${theme.border}` }}>
                      <Button variant="ghost" size="small" onClick={() => handleEdit(pos)}>✏️ Editar</Button>
                      <Button variant="ghost" size="small" onClick={() => handleDelete(pos.id)}>🗑️</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Editar Função' : 'Nova Função'} footer={formFooter}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Operador de Projeção, Técnico de Som" required />
          
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Área</label>
            <select value={form.area_id} onChange={(e) => setForm({ ...form, area_id: e.target.value })} style={{ width: '100%', padding: '12px', border: `2px solid ${theme.border}`, borderRadius: '8px', fontSize: '14px', backgroundColor: theme.surface, color: theme.text }} required>
              <option value="">Selecione uma área</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name} ({a.ministry_name})</option>)}
            </select>
          </div>
          
          <Input label="Máximo de pessoas" type="number" min="1" value={form.max_people} onChange={(e) => setForm({ ...form, max_people: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

export default Positions;

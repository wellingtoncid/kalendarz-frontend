import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function Shifts() {
  const { theme } = useTheme();
  const [shifts, setShifts] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', start_time: '', end_time: '', day_of_week: '0',
    ministry_id: '', area_id: '', description: '',
    recurrence: 'weekly', recurrence_end: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shiftRes, minRes, areasRes] = await Promise.all([
        api.get('/shifts'),
        api.get('/ministries'),
        api.get('/areas')
      ]);
      setShifts(shiftRes.data || []);
      setMinistries(minRes.data || []);
      setAreas(areasRes.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/shifts/${editing}`, form);
      } else {
        await api.post('/shifts', form);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving shift:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este evento?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const openEdit = (shift) => {
    setEditing(shift.id);
    setForm({
      name: shift.name, start_time: shift.start_time, end_time: shift.end_time,
      day_of_week: shift.day_of_week?.toString() || '0',
      ministry_id: shift.ministry_id || '', area_id: shift.area_id || '',
      description: shift.description || '', recurrence: 'weekly', recurrence_end: ''
    });
    setShowForm(true);
  };

  const resetForm = () => setForm({
    name: '', start_time: '', end_time: '', day_of_week: '0',
    ministry_id: '', area_id: '', description: '',
    recurrence: 'weekly', recurrence_end: ''
  });

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">🕐 Eventos</h1>
        <Button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}>
          + Novo Evento
        </Button>
      </div>

      {shifts.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>Nenhum evento cadastrado</p>
          </div>
        </Card>
      ) : (
        <div className="cards-grid">
          {shifts.map((shift) => (
            <Card key={shift.id} style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: theme.text }}>{shift.name}</h3>
              <div style={{ color: theme.textSecondary, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>📅 {days[shift.day_of_week] || 'Todos os dias'}</div>
                <div>⏰ {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}</div>
                {shift.ministry_name && <div>⛪ {shift.ministry_name}</div>}
                {shift.area_name && <div>📍 {shift.area_name}</div>}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <Button size="small" variant="ghost" onClick={() => openEdit(shift)}>✏️ Editar</Button>
                <Button size="small" variant="ghost" onClick={() => handleDelete(shift.id)}>🗑️</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Editar Evento' : 'Novo Evento'} footer={<>
        <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
        <Button onClick={handleSave}>{editing ? 'Salvar' : 'Criar'}</Button>
      </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Culto da Manhã" required />
          
          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Dia da Semana</label>
            <select className="form-input" value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}>
              {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Hora de Início" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            <Input label="Hora de Término" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Ministério (opcional)</label>
            <select className="form-input" value={form.ministry_id} onChange={(e) => setForm({ ...form, ministry_id: e.target.value, area_id: '' })}>
              <option value="">Todos</option>
              {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          {form.ministry_id && (
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>Área (opcional)</label>
              <select className="form-input" value={form.area_id} onChange={(e) => setForm({ ...form, area_id: e.target.value })}>
                <option value="">Todas</option>
                {areas.filter(a => a.ministry_id == form.ministry_id).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}

          <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes do evento..." />
        </div>
      </Modal>
    </div>
  );
}

export default Shifts;

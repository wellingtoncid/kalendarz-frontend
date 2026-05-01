import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function Shifts() {
  const { theme } = useTheme();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', start_time: '', end_time: '', day_of_week: '0' });

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts');
      setShifts(res.data || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
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
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', start_time: '', end_time: '', day_of_week: '0' });
      fetchShifts();
    } catch (err) {
      console.error('Error saving shift:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este turno?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      fetchShifts();
    } catch (err) {
      console.error('Error deleting shift:', err);
    }
  };

  const openEdit = (shift) => {
    setEditing(shift.id);
    setForm({
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      day_of_week: shift.day_of_week?.toString() || '0'
    });
    setShowModal(true);
  };

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Turnos</h1>
        <Button onClick={() => { setEditing(null); setForm({ name: '', start_time: '', end_time: '', day_of_week: '0' }); setShowModal(true); }}>
          + Novo Turno
        </Button>
      </div>

      {shifts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🕐</div>
          <div className="empty-state-title">Nenhum turno encontrado</div>
          <div className="empty-state-text">Crie seu primeiro turno para começar</div>
        </div>
      ) : (
        <div className="cards-grid">
          {shifts.map((shift) => (
            <Card key={shift.id} hoverable onClick={() => openEdit(shift)}>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: theme.text }}>
                {shift.name}
              </h3>
              <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
                <div>📅 {days[shift.day_of_week] || 'Todos os dias'}</div>
                <div>⏰ {shift.start_time} - {shift.end_time}</div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <Button size="small" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(shift); }}>
                  Editar
                </Button>
                <Button size="small" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(shift.id); }}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Turno' : 'Novo Turno'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="form-label">Dia da Semana</label>
            <select
              className="form-input"
              value={form.day_of_week}
              onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
            >
              <option value="0">Domingo</option>
              <option value="1">Segunda-feira</option>
              <option value="2">Terça-feira</option>
              <option value="3">Quarta-feira</option>
              <option value="4">Quinta-feira</option>
              <option value="5">Sexta-feira</option>
              <option value="6">Sábado</option>
            </select>
          </div>
          <Input label="Hora de Início" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
          <Input label="Hora de Término" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button onClick={handleSave}>{editing ? 'Salvar' : 'Criar'}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Shifts;
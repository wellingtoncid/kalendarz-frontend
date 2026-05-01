import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function Availability() {
  const { theme } = useTheme();
  const [volunteers, setVolunteers] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [volRes, availRes] = await Promise.all([
        api.get('/volunteers'),
        api.get('/availabilities')
      ]);
      setVolunteers(volRes.data || []);
      setAvailabilities(availRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!selectedVolunteer || selectedDays.length === 0) {
      alert('Selecione um voluntário e pelo menos um dia');
      return;
    }
    try {
      await api.post('/availabilities', {
        volunteer_id: selectedVolunteer,
        days: selectedDays
      });
      setShowModal(false);
      setSelectedVolunteer('');
      setSelectedDays([]);
      fetchData();
    } catch (err) {
      console.error('Error saving availability:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta disponibilidade?')) return;
    try {
      await api.delete(`/availabilities/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting availability:', err);
    }
  };

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const getVolunteerName = (id) => {
    const vol = volunteers.find(v => v.id === id);
    return vol ? vol.name : `Voluntário #${id}`;
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Disponibilidade</h1>
        <Button onClick={() => setShowModal(true)}>+ Nova Disponibilidade</Button>
      </div>

      {availabilities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">Nenhuma disponibilidade cadastrada</div>
          <div className="empty-state-text">Adicione a disponibilidade dos voluntários</div>
        </div>
      ) : (
        <div className="cards-grid">
          {availabilities.map((avail) => (
            <Card key={avail.id}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '600', color: theme.text }}>
                {getVolunteerName(avail.volunteer_id)}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {avail.days?.map((day, idx) => (
                  <span key={idx} className="badge badge-info">{days[day]}</span>
                ))}
              </div>
              <div style={{ marginTop: '12px' }}>
                <Button size="small" variant="ghost" onClick={() => handleDelete(avail.id)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Disponibilidade">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Voluntário</label>
            <select
              className="form-input"
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
            >
              <option value="">Selecione...</option>
              {volunteers.map(vol => (
                <option key={vol.id} value={vol.id}>{vol.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Dias Disponíveis</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {days.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: selectedDays.includes(idx) ? `2px solid ${theme.primary}` : '1px solid #E2E8F0',
                    backgroundColor: selectedDays.includes(idx) ? theme.primary + '20' : 'white',
                    color: selectedDays.includes(idx) ? theme.primary : theme.text,
                    cursor: 'pointer',
                    fontWeight: selectedDays.includes(idx) ? '600' : '400'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button onClick={handleSave}>Salvar</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Availability;
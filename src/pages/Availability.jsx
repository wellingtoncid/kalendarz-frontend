import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function Availability() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, availRes] = await Promise.all([
        api.get('/users'),
        api.get('/availabilities')
      ]);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setAvailabilities(Array.isArray(availRes.data) ? availRes.data : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setUsers([]);
      setAvailabilities([]);
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
    if (!selectedUser || selectedDays.length === 0) {
      alert('Selecione um usuário e pelo menos um dia');
      return;
    }
    try {
      await api.post('/availabilities', {
        user_id: selectedUser,
        days: selectedDays
      });
      setShowModal(false);
      setSelectedUser('');
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

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : `Usuário #${id}`;
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Disponibilidade</h1>
        <Button onClick={() => setShowModal(true)}>+ Nova Disponibilidade</Button>
      </div>

      {availabilities.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>Nenhuma disponibilidade cadastrada</p>
            <Button onClick={() => setShowModal(true)} icon="➕">Adicionar Disponibilidade</Button>
          </div>
        </Card>
      ) : (
        <div className="cards-grid">
          {availabilities.map((avail) => (
            <Card key={avail.id}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '600', color: theme.text }}>
                {getUserName(avail.user_id || avail.volunteer_id)}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(avail.days || []).map((day, idx) => (
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
            <label className="form-label">Usuário</label>
            <select
              className="form-input"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Selecione...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
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

import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function ConfirmSchedule() {
  const { theme } = useTheme();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? '' : filter;
      const res = await api.get(`/assignments?status=${status}`);
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/assignments/${id}`, { status });
      fetchAssignments();
      setSelectedAssignment(null);
    } catch (err) {
      console.error('Error updating assignment:', err);
    }
  };

  const handleSendWhatsApp = async (assignment) => {
    try {
      await api.post('/notifications/whatsapp', {
        volunteer_id: assignment.volunteer_id,
        message: `Olá! Você está escalado para ${assignment.shift_name} no dia ${assignment.date}. Confirme sua presença.`
      });
      alert('Mensagem enviada via WhatsApp!');
    } catch (err) {
      console.error('Error sending WhatsApp:', err);
      alert('Erro ao enviar mensagem');
    }
  };

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Confirmar Escala</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['pending', 'confirmed', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: filter === f ? 'none' : '1px solid #E2E8F0',
              backgroundColor: filter === f ? theme.primary : 'white',
              color: filter === f ? 'white' : theme.text,
              cursor: 'pointer',
              fontWeight: filter === f ? '600' : '400'
            }}
          >
            {f === 'pending' ? 'Pendentes' : f === 'confirmed' ? 'Confirmadas' : 'Todas'}
          </button>
        ))}
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">Nenhuma atribuição encontrada</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {assignments.map((assign) => (
            <Card key={assign.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: theme.text }}>
                    {assign.volunteer_name}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                    {assign.shift_name} • {assign.date}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${assign.status === 'confirmed' ? 'badge-success' : assign.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                    {assign.status === 'confirmed' ? 'Confirmado' : assign.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                  </span>
                  <Button size="small" variant="ghost" onClick={() => setSelectedAssignment(assign)}>
                    Ações
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} title="Ações">
        {selectedAssignment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p><strong>Voluntário:</strong> {selectedAssignment.volunteer_name}</p>
            <p><strong>Turno:</strong> {selectedAssignment.shift_name}</p>
            <p><strong>Data:</strong> {selectedAssignment.date}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <Button size="small" onClick={() => handleStatusChange(selectedAssignment.id, 'confirmed')}>
                ✅ Confirmar
              </Button>
              <Button size="small" variant="danger" onClick={() => handleStatusChange(selectedAssignment.id, 'rejected')}>
                ❌ Rejeitar
              </Button>
              <Button size="small" variant="secondary" onClick={() => handleSendWhatsApp(selectedAssignment)}>
                📱 Enviar WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ConfirmSchedule;
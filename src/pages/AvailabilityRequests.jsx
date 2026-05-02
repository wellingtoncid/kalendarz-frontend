import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function AvailabilityRequests() {
  const { theme } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', ministry_id: '', start_date: '', end_date: '' });
  const [ministries, setMinistries] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, minRes] = await Promise.all([
        api.get('/availability-requests'),
        api.get('/ministries')
      ]);
      setRequests(reqRes.data || []);
      setMinistries(minRes.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await api.get(`/availability-requests/${id}`);
      setSelectedRequest(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/availability-requests', form);
      setShowForm(false);
      setForm({ name: '', ministry_id: '', start_date: '', end_date: '' });
      fetchData();
    } catch (err) {
      alert('Erro ao criar solicitação');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta solicitação?')) return;
    try {
      await api.delete(`/availability-requests/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const copyLink = (token) => {
    const url = `${window.location.origin}/availability/${token}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado!');
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">📨 Solicitações de Disponibilidade</h1>
        <Button onClick={() => setShowForm(true)}>+ Nova Solicitação</Button>
      </div>

      {requests.length === 0 ? (
        <Card><div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>Nenhuma solicitação criada</div></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {requests.map(req => (
            <Card key={req.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>{req.name}</div>
                  <div style={{ fontSize: '13px', color: theme.textSecondary }}>{req.ministry_name}</div>
                </div>
                <span className={`badge ${req.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{req.status === 'active' ? 'Ativa' : 'Encerrada'}</span>
              </div>
              <div style={{ fontSize: '13px', color: theme.textSecondary }}>📅 {req.start_date} até {req.end_date}</div>
              {req.responses_count !== undefined && (
                <div style={{ fontSize: '13px', color: theme.primary, fontWeight: '500' }}>✅ {req.responses_count} respostas</div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${theme.border}` }}>
                <Button size="small" variant="ghost" onClick={() => viewDetails(req.id)}>👁️ Ver Respostas</Button>
                <Button size="small" variant="ghost" onClick={() => copyLink(req.token)}>🔗 Copiar Link</Button>
                <Button size="small" variant="ghost" onClick={() => handleDelete(req.id)}>🗑️</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedRequest && (
        <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title={`Respostas - ${selectedRequest.name}`} footer={<Button onClick={() => setSelectedRequest(null)}>Fechar</Button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              Período: {selectedRequest.start_date} até {selectedRequest.end_date}
            </div>
            {selectedRequest.responses?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedRequest.responses.map((resp, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{resp.volunteer_name}</div>
                      <div style={{ fontSize: '13px', color: theme.textSecondary }}>{resp.event_date}</div>
                    </div>
                    <span className={`badge ${resp.status === 'available' ? 'badge-success' : resp.status === 'unavailable' ? 'badge-error' : 'badge-warning'}`}>
                      {resp.status === 'available' ? 'Disponível' : resp.status === 'unavailable' ? 'Indisponível' : 'Talvez'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: theme.textSecondary }}>Nenhuma resposta ainda</div>
            )}
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova Solicitação" footer={<>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Criar</Button>
        </>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input className="form-input" placeholder="Nome da solicitação" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="form-input" value={form.ministry_id} onChange={(e) => setForm({ ...form, ministry_id: e.target.value })}>
              <option value="">Selecione o ministério</option>
              {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={{ fontSize: '13px', fontWeight: '600' }}>Data Início</label><input type="date" className="form-input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: '600' }}>Data Fim</label><input type="date" className="form-input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <p style={{ fontSize: '13px', color: theme.textSecondary }}>Um link único será gerado para compartilhar com os membros. Eles poderão responder quais datas estão disponíveis.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AvailabilityRequests;

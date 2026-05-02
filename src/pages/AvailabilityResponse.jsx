import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function AvailabilityResponse() {
  const { token } = useParams();
  const [request, setRequest] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [responses, setResponses] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [token]);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/availability/${token}`);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setRequest(res.data);
        setVolunteers(res.data.volunteers || []);
      }
    } catch (err) {
      setError('Solicitação inválida ou expirada');
    } finally {
      setLoading(false);
    }
  };

  const setResponse = (date, status) => {
    setResponses({ ...responses, [date]: status });
  };

  const handleSubmit = async () => {
    if (!selectedVolunteer) {
      alert('Selecione seu nome');
      return;
    }
    if (Object.keys(responses).length === 0) {
      alert('Selecione pelo menos uma data');
      return;
    }
    setSaving(true);
    try {
      for (const [date, status] of Object.entries(responses)) {
        await api.post(`/availability/${token}`, {
          volunteer_id: selectedVolunteer,
          event_date: date,
          status
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Error saving responses:', err);
      alert('Erro ao salvar respostas');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '18px', color: '#64748B' }}>Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#DC2626', marginBottom: '8px' }}>Solicitação Inválida</h2>
          <p style={{ color: '#64748B' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#16A34A', marginBottom: '8px' }}>Disponibilidade Enviada!</h2>
          <p style={{ color: '#64748B' }}>Obrigado por responder. Sua disponibilidade foi registrada com sucesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <header style={{ backgroundColor: 'white', padding: '16px 24px', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>Kalendarz</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>{request.name}</p>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>Selecione seu nome</h2>
          <select
            value={selectedVolunteer}
            onChange={(e) => setSelectedVolunteer(e.target.value)}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0',
              fontSize: '16px', backgroundColor: 'white'
            }}
          >
            <option value="">Seu nome...</option>
            {volunteers.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {selectedVolunteer && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>Marque sua disponibilidade</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {request.events?.map((ev, idx) => {
                const date = ev.event_date;
                const status = responses[date];
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px',
                  }}>
                    <div>
                      <span style={{ fontWeight: '500' }}>{date}</span>
                      <span style={{ color: '#64748B', marginLeft: '12px', fontSize: '14px' }}>
                        {ev.event_time?.slice(0, 5)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setResponse(date, 'available')}
                        style={{
                          padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          backgroundColor: status === 'available' ? '#22C55E' : '#E2E8F0',
                          color: status === 'available' ? 'white' : '#64748B',
                          fontWeight: '600', fontSize: '14px',
                        }}
                      >
                        ✅ Disponível
                      </button>
                      <button
                        onClick={() => setResponse(date, 'unavailable')}
                        style={{
                          padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          backgroundColor: status === 'unavailable' ? '#EF4444' : '#E2E8F0',
                          color: status === 'unavailable' ? 'white' : '#64748B',
                          fontWeight: '600', fontSize: '14px',
                        }}
                      >
                        ❌ Indisponível
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving || Object.keys(responses).length === 0}
              style={{
                width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                backgroundColor: Object.keys(responses).length === 0 ? '#CBD5E1' : '#0EA5E9',
                color: 'white', fontWeight: '600', fontSize: '16px', cursor: 'pointer',
              }}
            >
              {saving ? 'Enviando...' : 'Enviar Disponibilidade'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default AvailabilityResponse;

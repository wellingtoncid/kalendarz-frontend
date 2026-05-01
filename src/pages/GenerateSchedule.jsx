import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function GenerateSchedule() {
  const { theme } = useTheme();
  const [ministries, setMinistries] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    ministry_id: '',
    shift_id: ''
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [minRes, shiftRes] = await Promise.all([
        api.get('/ministries'),
        api.get('/shifts')
      ]);
      setMinistries(minRes.data || []);
      setShifts(shiftRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!form.start_date || !form.end_date || !form.ministry_id || !form.shift_id) {
      alert('Preencha todos os campos');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/schedules/generate', form);
      setResult(res.data);
    } catch (err) {
      console.error('Error generating schedule:', err);
      alert('Erro ao gerar escala');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (!result) return;
    try {
      await api.post('/schedules/confirm', { assignments: result.assignments });
      alert('Escala confirmada com sucesso!');
      setResult(null);
      setForm({ start_date: '', end_date: '', ministry_id: '', shift_id: '' });
    } catch (err) {
      console.error('Error confirming schedule:', err);
      alert('Erro ao confirmar escala');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="page-title">Gerar Escala</h1>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label className="form-label">Data Início</label>
            <input
              type="date"
              className="form-input"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Data Término</label>
            <input
              type="date"
              className="form-input"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Ministério</label>
            <select
              className="form-input"
              value={form.ministry_id}
              onChange={(e) => setForm({ ...form, ministry_id: e.target.value })}
            >
              <option value="">Selecione...</option>
              {ministries.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Turno</label>
            <select
              className="form-input"
              value={form.shift_id}
              onChange={(e) => setForm({ ...form, shift_id: e.target.value })}
            >
              <option value="">Selecione...</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? 'Gerando...' : '⚡ Gerar Escala'}
          </Button>
        </div>
      </Card>

      {result && (
        <Card style={{ marginTop: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>
            Preview da Escala ({result.assignments?.length} atribuições)
          </h2>
          {result.assignments?.length === 0 ? (
            <p style={{ color: theme.textSecondary }}>Nenhuma atribuição gerada</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.assignments.slice(0, 10).map((assign, idx) => (
                <div key={idx} style={{
                  padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px',
                  display: 'flex', justifyContent: 'space-between'
                }}>
                  <span style={{ fontWeight: '500' }}>{assign.volunteer_name}</span>
                  <span style={{ color: theme.textSecondary }}>{assign.date}</span>
                </div>
              ))}
              {result.assignments.length > 10 && (
                <p style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  ...e mais {result.assignments.length - 10} atribuições
                </p>
              )}
            </div>
          )}
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <Button onClick={handleConfirm}>✅ Confirmar Escala</Button>
            <Button variant="secondary" onClick={() => setResult(null)}>Cancelar</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default GenerateSchedule;
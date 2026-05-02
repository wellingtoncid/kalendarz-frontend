import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const DAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function GenerateSchedule() {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ministries, setMinistries] = useState([]);
  const [areas, setAreas] = useState([]);
  const [positions, setPositions] = useState([]);
  const [errors, setErrors] = useState({});

  // Step 1: Config
  const [config, setConfig] = useState({
    name: '', ministry_id: '', area_id: '', start_date: '', end_date: '', frequency: 'weekly'
  });

  // Step 2: Events
  const [events, setEvents] = useState([]);

  // Step 3: Roles (from area positions)
  const [roles, setRoles] = useState([]);

  // Step 4: Rules & Preview
  const [rules, setRules] = useState({
    max_scales_per_period: 4,
    max_positions_per_day: 1,
    allow_multi_position_same_day: false,
    repeat_volunteers_same_day: false
  });
  const [generationResult, setGenerationResult] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [minRes, areasRes, posRes] = await Promise.all([
        api.get('/ministries'), api.get('/areas'), api.get('/positions')
      ]);
      setMinistries(minRes.data || []);
      setAreas(areasRes.data || []);
      setPositions(posRes.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // When area changes, load positions for that area as default roles
  const handleAreaChange = async (areaId) => {
    setConfig({ ...config, area_id: areaId });
    if (areaId) {
      try {
        const res = await api.get(`/positions/area/${areaId}`);
        const areaPositions = res.data || [];
        setRoles(areaPositions.map(p => ({
          name: p.name,
          max_people: p.max_people || 1,
          skill_keyword: '',
          position_id: p.id
        })));
      } catch (err) {
        console.error('Error loading positions:', err);
      }
    } else {
      setRoles([]);
    }
  };

  const generateEventsFromConfig = () => {
    if (!config.start_date || !config.end_date) return;
    const start = new Date(config.start_date + 'T00:00:00');
    const end = new Date(config.end_date + 'T00:00:00');
    const generated = [];
    let current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];
      if (config.frequency === 'weekly' || (config.frequency === 'biweekly' && Math.floor((current - start) / (7 * 24 * 60 * 60 * 1000)) % 2 === 0) || (config.frequency === 'monthly' && dayOfWeek === 0)) {
        generated.push({ title: `Culto ${DAYS_PT[dayOfWeek]}`, event_date: dateStr, event_time: dayOfWeek === 0 ? '09:00:00' : '19:30:00' });
      }
      current.setDate(current.getDate() + 1);
    }
    setEvents(generated);
  };

  const validateStep1 = () => {
    const errs = {};
    if (!config.name.trim()) errs.name = 'Nome é obrigatório';
    if (!config.ministry_id) errs.ministry_id = 'Selecione um ministério';
    if (!config.start_date) errs.start_date = 'Data início é obrigatória';
    if (!config.end_date) errs.end_date = 'Data término é obrigatória';
    if (config.start_date && config.end_date && config.start_date > config.end_date) errs.end_date = 'Data término deve ser após data início';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      generateEventsFromConfig();
      setSaving(true);
      try {
        const res = await api.post('/schedule-groups', config);
        setGroupId(res.data.id);
      } catch (err) {
        alert('Erro ao criar grupo');
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    if (step === 2) {
      if (events.length === 0) { alert('Gere pelo menos um evento'); return; }
      setSaving(true);
      try {
        await api.post(`/schedule-groups/${groupId}/events`, { events });
      } catch (err) {
        alert('Erro ao salvar eventos');
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    if (step === 3) {
      if (roles.length === 0) { alert('Adicione pelo menos uma função'); return; }
      // Load available users for preview
      try {
        const ministryId = config.ministry_id;
        const areaId = config.area_id;
        const endpoint = areaId ? `/users/area/${areaId}` : `/users/ministry/${ministryId}`;
        const res = await api.get(endpoint);
        setAvailableUsers(res.data || []);
      } catch (err) {
        setAvailableUsers([]);
      }
    }
    setStep(step + 1);
  };

  const handlePrev = () => { setErrors({}); setStep(step - 1); };

  const handleGenerate = async () => {
    if (availableUsers.length === 0) {
      alert('Não há membros disponíveis nesta área/ministério para gerar a escala. Adicione membros primeiro em Usuários.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/schedule-groups/${groupId}/generate`, { rules });
      setGenerationResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao gerar escala');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await api.post(`/schedule-groups/${groupId}/confirm`);
      alert('Escala confirmada!');
      setStep(1); setGroupId(null); setGenerationResult(null);
      setConfig({ name: '', ministry_id: '', area_id: '', start_date: '', end_date: '', frequency: 'weekly' });
      setEvents([]); setRoles([]);
    } catch (err) {
      alert('Erro ao confirmar escala');
    } finally {
      setSaving(false);
    }
  };

  const addRole = () => { setRoles([...roles, { name: 'Nova Função', max_people: 1, skill_keyword: '', id: Date.now() }]); };
  const removeRole = (id) => { setRoles(roles.filter(r => r.id !== id)); };
  const updateRole = (id, field, value) => { setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r)); };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Carregando...</div>;

  const filteredAreas = areas.filter(a => a.ministry_id == config.ministry_id);
  const steps = ['Configuração', 'Eventos', 'Funções', 'Regras e Preview'];

  return (
    <div>
      <h1 className="page-title">⚡ Gerar Escala</h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', backgroundColor: step > i + 1 ? theme.success : step === i + 1 ? theme.primary : '#E2E8F0', color: step >= i + 1 ? 'white' : '#64748B', fontWeight: step === i + 1 ? '600' : '400', fontSize: '14px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Config */}
      {step === 1 && (
        <Card>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600' }}>Configuração da Escala</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label">Nome da Escala</label>
              <input type="text" className="form-input" placeholder="Ex: Escala Maio 2026" value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} style={{ borderColor: errors.name ? theme.error : undefined }} />
              {errors.name && <span style={{ color: theme.error, fontSize: '12px' }}>{errors.name}</span>}
            </div>
            <div>
              <label className="form-label">Ministério</label>
              <select className="form-input" value={config.ministry_id} onChange={(e) => setConfig({ ...config, ministry_id: e.target.value, area_id: '' })} style={{ borderColor: errors.ministry_id ? theme.error : undefined }}>
                <option value="">Selecione...</option>
                {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              {errors.ministry_id && <span style={{ color: theme.error, fontSize: '12px' }}>{errors.ministry_id}</span>}
            </div>
            {config.ministry_id && (
              <div>
                <label className="form-label">Área</label>
                <select className="form-input" value={config.area_id} onChange={(e) => handleAreaChange(e.target.value)}>
                  <option value="">Todas as áreas do ministério</option>
                  {filteredAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="form-label">Data Início</label>
              <input type="date" className="form-input" value={config.start_date} onChange={(e) => setConfig({ ...config, start_date: e.target.value })} style={{ borderColor: errors.start_date ? theme.error : undefined }} />
              {errors.start_date && <span style={{ color: theme.error, fontSize: '12px' }}>{errors.start_date}</span>}
            </div>
            <div>
              <label className="form-label">Data Término</label>
              <input type="date" className="form-input" value={config.end_date} onChange={(e) => setConfig({ ...config, end_date: e.target.value })} style={{ borderColor: errors.end_date ? theme.error : undefined }} />
              {errors.end_date && <span style={{ color: theme.error, fontSize: '12px' }}>{errors.end_date}</span>}
            </div>
            <div>
              <label className="form-label">Frequência</label>
              <select className="form-input" value={config.frequency} onChange={(e) => setConfig({ ...config, frequency: e.target.value })}>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Events */}
      {step === 2 && (
        <Card>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600' }}>Eventos ({events.length})</h2>
          {events.length === 0 ? <p style={{ color: theme.textSecondary }}>Nenhum evento gerado. Volte e ajuste as datas.</p> : (
            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {events.map((ev, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '500', flex: 1 }}>{ev.title}</span>
                  <span style={{ color: theme.textSecondary, fontSize: '14px' }}>{ev.event_date}</span>
                  <input type="time" value={ev.event_time?.slice(0, 5) || ''} onChange={(e) => { const u = [...events]; u[idx].event_time = e.target.value + ':00'; setEvents(u); }} className="form-input" style={{ width: '100px', padding: '4px 8px' }} />
                  <button onClick={() => setEvents(events.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.error, fontSize: '18px' }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '16px' }}>
            <Button variant="secondary" size="small" onClick={() => setEvents([...events, { title: 'Novo Evento', event_date: '', event_time: '09:00:00' }])}>+ Adicionar Evento</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Roles */}
      {step === 3 && (
        <Card>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600' }}>Funções / Posições ({roles.length})</h2>
          {config.area_id && <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>Funções carregadas automaticamente da área selecionada. Você pode editar ou adicionar mais.</p>}
          {roles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {roles.map((role) => (
                <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <input type="text" className="form-input" value={role.name} onChange={(e) => updateRole(role.id, 'name', e.target.value)} style={{ flex: 1 }} />
                  <input type="number" className="form-input" value={role.max_people} onChange={(e) => updateRole(role.id, 'max_people', parseInt(e.target.value) || 1)} style={{ width: '70px' }} min="1" />
                  <button onClick={() => removeRole(role.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.error, fontSize: '18px' }}>×</button>
                </div>
              ))}
            </div>
          )}
          <Button size="small" onClick={addRole}>+ Adicionar Função</Button>
        </Card>
      )}

      {/* Step 4: Rules & Preview */}
      {step === 4 && (
        <>
          <Card>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600' }}>Regras de Distribuição</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label className="form-label">Máx. escalas por período</label>
                <input type="number" className="form-input" value={rules.max_scales_per_period} onChange={(e) => setRules({ ...rules, max_scales_per_period: parseInt(e.target.value) || 1 })} min="1" />
              </div>
              <div>
                <label className="form-label">Máx. posições por dia</label>
                <input type="number" className="form-input" value={rules.max_positions_per_day} onChange={(e) => setRules({ ...rules, max_positions_per_day: parseInt(e.target.value) || 1 })} min="1" />
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <input type="checkbox" checked={rules.allow_multi_position_same_day} onChange={(e) => setRules({ ...rules, allow_multi_position_same_day: e.target.checked })} style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Permitir mesma pessoa em múltiplas posições no mesmo dia</div>
                  <div style={{ fontSize: '13px', color: theme.textSecondary }}>Uma pessoa pode ser escalada como Operador E Supervisor no mesmo culto</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <input type="checkbox" checked={rules.repeat_volunteers_same_day} onChange={(e) => setRules({ ...rules, repeat_volunteers_same_day: e.target.checked })} style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Repetir membros em todos os turnos do mesmo dia</div>
                  <div style={{ fontSize: '13px', color: theme.textSecondary }}>Quando ativado, os mesmos membros serão escalados para todos os eventos do dia (ex: culto manhã e noite). Ideal para manter a mesma equipe.</div>
                </div>
              </label>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <Button onClick={handleGenerate} disabled={saving}>
                {saving ? 'Gerando...' : `⚡ Gerar Escala (${availableUsers.length} membros disponíveis)`}
              </Button>
            </div>
          </Card>

          {generationResult && (
            <Card style={{ marginTop: '24px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>Preview ({generationResult.total_assignments} atribuições)</h2>
              {generationResult.assignments?.length === 0 ? (
                <div style={{ padding: '20px', backgroundColor: '#FEF2F2', borderRadius: '8px' }}>
                  <p style={{ color: theme.error, fontWeight: '600' }}>Nenhuma atribuição gerada.</p>
                  <p style={{ fontSize: '14px', color: theme.textSecondary }}>Verifique: membros na área, disponibilidade, e se as funções correspondem às habilidades.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead><tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Data</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Evento</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Função</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Membro</th>
                    </tr></thead>
                    <tbody>
                      {generationResult.assignments.map((a, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '8px' }}>{a.event_date}</td>
                          <td style={{ padding: '8px' }}>{a.event_title}</td>
                          <td style={{ padding: '8px' }}>{a.role_name}</td>
                          <td style={{ padding: '8px', fontWeight: '500' }}>{a.user_name || a.volunteer_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {generationResult.unassigned?.length > 0 && (
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
                  <strong style={{ color: '#92400E' }}>⚠ Funções não preenchidas:</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: '#92400E', fontSize: '14px' }}>
                    {generationResult.unassigned.map((u, idx) => (<li key={idx}>{u.event_date} - {u.event_title}: {u.role_name} (faltam {u.needed})</li>))}
                  </ul>
                </div>
              )}
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <Button onClick={handleConfirm} disabled={saving || !generationResult?.total_assignments}>✅ Confirmar Escala</Button>
                <Button variant="secondary" onClick={handleGenerate} disabled={saving}>🔄 Regenerar</Button>
              </div>
            </Card>
          )}
        </>
      )}

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={handlePrev} disabled={step === 1 || saving}>← Anterior</Button>
        {step < 4 && <Button onClick={handleNext} disabled={saving}>{saving ? 'Salvando...' : 'Próximo →'}</Button>}
      </div>
    </div>
  );
}

export default GenerateSchedule;

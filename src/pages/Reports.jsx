import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

function Reports() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('summary');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports?type=${reportType}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const stats = [
    { label: 'Total Voluntários', value: data?.total_volunteers || 0, icon: '👥' },
    { label: 'Total Atribuições', value: data?.total_assignments || 0, icon: '📋' },
    { label: 'Confirmadas', value: data?.confirmed || 0, icon: '✅' },
    { label: 'Pendentes', value: data?.pending || 0, icon: '⏳' },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Relatórios</h1>
        <Button variant="secondary" onClick={exportToPDF}>📄 Exportar PDF</Button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'summary', label: 'Resumo' },
          { id: 'volunteers', label: 'Por Voluntário' },
          { id: 'ministries', label: 'Por Ministério' },
          { id: 'shifts', label: 'Por Turno' },
        ].map(type => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: reportType === type.id ? 'none' : '1px solid #E2E8F0',
              backgroundColor: reportType === type.id ? theme.primary : 'white',
              color: reportType === type.id ? 'white' : theme.text,
              cursor: 'pointer',
              fontWeight: reportType === type.id ? '600' : '400',
            }}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: theme.primary }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {reportType === 'volunteers' && data?.by_volunteer && (
        <Card>
          <h3 style={{ margin: '0 0 16px' }}>Atribuições por Voluntário</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.by_volunteer.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>{item.name}</span>
                <span className="badge badge-info">{item.count} atribuições</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {reportType === 'ministries' && data?.by_ministry && (
        <Card>
          <h3 style={{ margin: '0 0 16px' }}>Atribuições por Ministério</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.by_ministry.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>{item.name}</span>
                <span className="badge badge-info">{item.count} atribuições</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {reportType === 'shifts' && data?.by_shift && (
        <Card>
          <h3 style={{ margin: '0 0 16px' }}>Atribuições por Turno</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.by_shift.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>{item.name}</span>
                <span className="badge badge-info">{item.count} atribuições</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Reports;
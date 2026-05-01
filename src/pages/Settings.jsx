import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useTheme, themes } from '../context/ThemeContext';

function Settings() {
  const { theme, themeName, updateTheme, churchName, churchLogo, updateChurch } = useTheme();
  const [name, setName] = useState(churchName);
  const [logoUrl, setLogoUrl] = useState(churchLogo || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  
  const handleSave = () => {
    updateChurch(name, logoUrl || null);
    alert('Configurações salvas!');
  };
  
  const colorOptions = [
    { name: 'blue', label: 'Azul', color: '#2563EB' },
    { name: 'magenta', label: 'Magenta', color: '#9333EA' },
    { name: 'green', label: 'Verde', color: '#059669' },
  ];
  
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 className="page-title">
        ⚙️ Configurações
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Card>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, marginBottom: '20px' }}>
            🏛️ Informações da Igreja
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Nome da Igreja"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Igreja Batista Central"
            />
            
            <Input
              label="URL do Logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
            
            {logoUrl && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: theme.background, 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '10px' }}>
                  Preview do Logo:
                </p>
                <img 
                  src={logoUrl} 
                  alt="Logo preview" 
                  style={{ 
                    maxHeight: '80px', 
                    maxWidth: '200px',
                    objectFit: 'contain' 
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <p style={{ display: 'none', color: theme.error, fontSize: '14px' }}>
                  ❌ URL inválida
                </p>
              </div>
            )}
          </div>
        </Card>
        
        <Card>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, marginBottom: '20px' }}>
            🎨 Aparência
          </h2>
          
          <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>
            Escolha a cor principal do sistema:
          </p>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {colorOptions.map((opt) => (
              <button
                key={opt.name}
                onClick={() => updateTheme(opt.name)}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '12px',
                  border: themeName === opt.name 
                    ? `3px solid ${theme.text}` 
                    : `2px solid ${theme.border}`,
                  backgroundColor: theme.surface,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: opt.color,
                }}></div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: themeName === opt.name ? '600' : '400',
                  color: theme.text,
                }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </Card>
        
        <Card>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, marginBottom: '20px' }}>
            📱 WhatsApp
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="WhatsApp Oficial"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+55 11 99999-9999"
            />
            
            <p style={{ fontSize: '13px', color: theme.textSecondary }}>
              Este número será usado para enviar confirmações de escala aos voluntários via WhatsApp.
            </p>
          </div>
        </Card>
        
        <Card>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, marginBottom: '20px' }}>
            🌐 Website
          </h2>
          
          <Input
            label="URL do Site"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://www.iglesjacentral.com.br"
          />
        </Card>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave} icon="💾">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
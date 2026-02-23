import React, { useState } from 'react';
import { analisarDadosERecomendar } from '../../geminiService'; // Ajuste o caminho se necessário

const DebugGemini = () => {
  const [temperatura, setTemperatura] = useState(25);
  const [dispositivos, setDispositivos] = useState([
    { nome: "Ar Condicionado", consumo_kwh: 1.2, estado: "on" },
    { nome: "Máquina de Lavar", consumo_kwh: 0.5, estado: "off" }
  ]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const testarIA = async () => {
    setLoading(true);
    const res = await analisarDadosERecomendar(dispositivos, temperatura);
    setResultado(res);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', color: 'white', background: '#1a1a1a', minHeight: '100vh' }}>
      <h1>🛠️ Debug Gemini - GoldEnergy</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Temperatura Atual: </label>
        <input 
          type="number" 
          value={temperatura} 
          onChange={(e) => setTemperatura(e.target.value)}
          style={{ padding: '5px', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Dispositivos (Simulação)</h3>
        {dispositivos.map((d, index) => (
          <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #333' }}>
            <p>{d.nome} - {d.consumo_kwh}kWh ({d.estado})</p>
          </div>
        ))}
      </div>

      <button 
        onClick={testarIA} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#666' : '#f39c12',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'A processar...' : 'Pedir Recomendação à IA'}
      </button>

      {resultado && (
        <div style={{ marginTop: '30px', padding: '15px', border: '2px solid #f39c12', borderRadius: '10px' }}>
          <h3>🤖 Resposta da IA:</h3>
          <p><strong>Urgência:</strong> {resultado.urgencia}</p>
          <p><strong>Recomendação:</strong> {resultado.recomendacao}</p>
          <pre style={{ fontSize: '12px', color: '#888' }}>
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugGemini;
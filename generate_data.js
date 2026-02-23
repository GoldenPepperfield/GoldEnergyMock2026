const fs = require('fs');

const generateRawHistory = (clientId = "GE-HACK-2026") => {
  const history = [];
  const startDate = new Date('2026-01-24');

  // Gerar 30 dias de leituras horárias reais (720 pontos de dados)
  for (let d = 0; d < 30; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);
    
    for (let h = 0; h < 24; h++) {
      const isPeak = (h >= 19 && h <= 22); // Pico noturno
      const base = isPeak ? 1.8 : 0.5;
      const consumption = parseFloat((base + Math.random() * 0.7).toFixed(2));
      
      history.push({
        timestamp: new Date(currentDate.setHours(h, 0, 0, 0)).toISOString(),
        kwh: consumption,
        cost_rate: h < 8 ? 0.10 : 0.22 // Tarifa bi-horária simples
      });
    }
  }
  fs.writeFileSync('raw_history.json', JSON.stringify({ clientId, history }, null, 2));
  console.log("✅ Dados brutos gerados em raw_history.json");
};

generateRawHistory();
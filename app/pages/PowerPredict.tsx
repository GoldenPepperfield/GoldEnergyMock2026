import { TrendingUp, TrendingDown, DollarSign, Zap, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function PowerPredict() {
  const historicalData = [
    { day: "Seg", consumption: 8.2, cost: 1.48 },
    { day: "Ter", consumption: 7.5, cost: 1.35 },
    { day: "Qua", consumption: 9.1, cost: 1.64 },
    { day: "Qui", consumption: 8.8, cost: 1.58 },
    { day: "Sex", consumption: 7.2, cost: 1.30 },
    { day: "Sáb", consumption: 10.5, cost: 1.89 },
    { day: "Dom", consumption: 11.2, cost: 2.02 },
  ];

  const predictionData = [
    { day: "Seg", predicted: 8.5, lower: 7.8, upper: 9.2 },
    { day: "Ter", predicted: 7.8, lower: 7.0, upper: 8.6 },
    { day: "Qua", predicted: 9.0, lower: 8.2, upper: 9.8 },
    { day: "Qui", predicted: 8.7, lower: 7.9, upper: 9.5 },
    { day: "Sex", predicted: 7.5, lower: 6.8, upper: 8.2 },
    { day: "Sáb", predicted: 10.8, lower: 9.9, upper: 11.7 },
    { day: "Dom", predicted: 11.5, lower: 10.5, upper: 12.5 },
  ];

  const todayPrediction = {
    consumption: 8.5,
    cost: 1.53,
    peakHours: "18:00 - 21:00",
    savings: 0.45,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PowerPredict</h1>
        <p className="text-gray-600">Previsões inteligentes de consumo e custos</p>
      </div>

      {/* Today's Prediction */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-8 mb-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={24} />
          <h2 className="text-2xl font-bold">Previsão para Hoje</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <Zap size={28} className="mb-2" />
            <p className="text-3xl font-bold">{todayPrediction.consumption} kWh</p>
            <p className="text-sm opacity-90">Consumo Previsto</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <DollarSign size={28} className="mb-2" />
            <p className="text-3xl font-bold">€{todayPrediction.cost}</p>
            <p className="text-sm opacity-90">Custo Estimado</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <TrendingUp size={28} className="mb-2" />
            <p className="text-3xl font-bold">{todayPrediction.peakHours}</p>
            <p className="text-sm opacity-90">Horário de Pico</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <TrendingDown size={28} className="mb-2" />
            <p className="text-3xl font-bold">€{todayPrediction.savings}</p>
            <p className="text-sm opacity-90">Poupança Potencial</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Historical Consumption */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Consumo da Última Semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="consumption" stroke="#8b5cf6" fill="#c4b5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Previsão Próxima Semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="lower" stroke="#c4b5fd" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="upper" stroke="#c4b5fd" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Área sombreada representa margem de erro da previsão
          </p>
        </div>
      </div>

      {/* Monthly Prediction */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Previsão Mensal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-600 mb-1">Consumo Estimado</p>
            <p className="text-3xl font-bold text-gray-900">245 kWh</p>
            <p className="text-sm text-green-600 mt-1">↓ 12% vs mês anterior</p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-600 mb-1">Custo Previsto</p>
            <p className="text-3xl font-bold text-gray-900">€44.10</p>
            <p className="text-sm text-green-600 mt-1">↓ €5.80 de poupança</p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-600 mb-1">Confiança da Previsão</p>
            <p className="text-3xl font-bold text-gray-900">87%</p>
            <p className="text-sm text-gray-500 mt-1">Baseado em 6 meses de dados</p>
          </div>
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <TrendingDown size={20} />
            Oportunidades de Poupança
          </h4>
          <ul className="space-y-2 text-sm text-green-800">
            <li>• Evitar uso de AC entre 18h-21h pode poupar €12/mês</li>
            <li>• Lavar roupa de madrugada economiza 30% na tarifa</li>
            <li>• Desligar standby pode reduzir 8% do consumo</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Zap size={20} />
            Padrões Detectados
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Picos de consumo: fins de semana (+25%)</li>
            <li>• Horário crítico: 19h-20h (1.8 kW média)</li>
            <li>• Melhor performance: terças e sextas</li>
          </ul>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 mt-6">
        <h4 className="font-semibold text-purple-900 mb-2">🤖 Insight da IA</h4>
        <p className="text-sm text-purple-800">
          Baseado no seu histórico, se reduzir 15% o consumo aos fins de semana e evitar o horário de ponta durante a semana, 
          pode poupar até <strong>€8.50/mês</strong>. Recomendamos ativar agendamentos no SmartPlug Connect.
        </p>
      </div>
    </div>
  );
}

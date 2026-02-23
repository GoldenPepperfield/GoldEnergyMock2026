import { Heart, AlertTriangle, CheckCircle, TrendingDown, Phone, Users } from "lucide-react";
import { useState } from "react";

interface MonitoredUser {
  id: string;
  name: string;
  relation: string;
  status: "normal" | "alert" | "critical";
  lastReading: string;
  avgConsumption: number;
  currentConsumption: number;
  alerts: number;
}

export function GoldCare() {
  const [monitoredUsers] = useState<MonitoredUser[]>([
    {
      id: "1",
      name: "Maria Silva",
      relation: "Avó",
      status: "normal",
      lastReading: "Hoje, 08:30",
      avgConsumption: 3.2,
      currentConsumption: 3.1,
      alerts: 0,
    },
    {
      id: "2",
      name: "João Santos",
      relation: "Pai",
      status: "alert",
      lastReading: "Hoje, 06:15",
      avgConsumption: 4.5,
      currentConsumption: 1.2,
      alerts: 1,
    },
    {
      id: "3",
      name: "Ana Ferreira",
      relation: "Vizinha",
      status: "normal",
      lastReading: "Hoje, 09:00",
      avgConsumption: 2.8,
      currentConsumption: 3.0,
      alerts: 0,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 border-green-300 text-green-800";
      case "alert":
        return "bg-orange-100 border-orange-300 text-orange-800";
      case "critical":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="text-green-600" size={20} />;
      case "alert":
        return <AlertTriangle className="text-orange-600" size={20} />;
      case "critical":
        return <AlertTriangle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GoldCare</h1>
        <p className="text-gray-600">Monitorização de consumo de famílias vulneráveis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-600" size={24} />
            <span className="text-2xl font-bold text-gray-900">3</span>
          </div>
          <p className="text-sm text-gray-600">Pessoas Monitorizadas</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <span className="text-2xl font-bold text-gray-900">2</span>
          </div>
          <p className="text-sm text-gray-600">Estado Normal</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-orange-600" size={24} />
            <span className="text-2xl font-bold text-gray-900">1</span>
          </div>
          <p className="text-sm text-gray-600">Alertas Ativos</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Heart className="text-red-600" size={24} />
            <span className="text-2xl font-bold text-gray-900">100%</span>
          </div>
          <p className="text-sm text-gray-600">Taxa de Resposta</p>
        </div>
      </div>

      {/* Active Alerts */}
      {monitoredUsers.some((user) => user.status !== "normal") && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">⚠️ Alerta de Consumo Anormal</h3>
              <p className="text-sm text-orange-800 mb-3">
                João Santos apresenta consumo 73% inferior ao normal nas últimas 24 horas. 
                Recomenda-se contacto para verificar bem-estar.
              </p>
              <div className="flex gap-2">
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">
                  <Phone size={16} />
                  Contactar Agora
                </button>
                <button className="bg-white text-orange-700 border border-orange-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors">
                  Marcar como Resolvido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monitored Users List */}
      <div className="space-y-4">
        {monitoredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.relation}</p>
                  <p className="text-xs text-gray-500 mt-1">Última leitura: {user.lastReading}</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(user.status)}`}>
                {getStatusIcon(user.status)}
                <span className="text-sm font-medium capitalize">{user.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Consumo Médio</p>
                <p className="text-lg font-bold text-gray-900">{user.avgConsumption} kWh/dia</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Consumo Atual</p>
                <p className="text-lg font-bold text-gray-900">{user.currentConsumption} kWh/dia</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Variação</p>
                <p className={`text-lg font-bold ${
                  user.currentConsumption < user.avgConsumption * 0.5 
                    ? "text-orange-600" 
                    : user.currentConsumption > user.avgConsumption * 1.5 
                      ? "text-orange-600" 
                      : "text-green-600"
                }`}>
                  {((user.currentConsumption - user.avgConsumption) / user.avgConsumption * 100).toFixed(0)}%
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Alertas (30d)</p>
                <p className="text-lg font-bold text-gray-900">{user.alerts}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Ver Detalhes
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Phone size={16} />
                Contactar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New User */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mt-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Users size={20} />
          Adicionar Pessoa para Monitorizar
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          Ajude a cuidar de familiares ou vizinhos vulneráveis monitorizando padrões de consumo anormais.
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Adicionar Nova Pessoa
        </button>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Como Funciona o GoldCare?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">👥</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Adicionar Pessoa</h4>
            <p className="text-sm text-gray-600">
              Convide familiares ou vizinhos vulneráveis para monitorização
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">2. Monitorização Automática</h4>
            <p className="text-sm text-gray-600">
              Sistema analisa padrões de consumo 24/7
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔔</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Alertas Inteligentes</h4>
            <p className="text-sm text-gray-600">
              Receba notificações de padrões anormais
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-6">
        <p className="text-sm text-gray-600 text-center">
          🔒 Todos os dados são encriptados e partilhados apenas com consentimento explícito. 
          A privacidade e segurança são prioritárias no GoldCare.
        </p>
      </div>
    </div>
  );
}

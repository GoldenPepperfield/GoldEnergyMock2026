import { useState } from "react";
import { Plug, Power, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { Switch } from "../components/ui/switch";

interface SmartPlug {
  id: string;
  name: string;
  room: string;
  status: boolean;
  currentPower: number;
  todayConsumption: number;
  peakDetected: boolean;
}

export function SmartPlugConnect() {
  const [plugs, setPlugs] = useState<SmartPlug[]>([
    {
      id: "1",
      name: "Ar Condicionado",
      room: "Sala",
      status: true,
      currentPower: 1200,
      todayConsumption: 4.5,
      peakDetected: true,
    },
    {
      id: "2",
      name: "Máquina de Lavar",
      room: "Lavandaria",
      status: false,
      currentPower: 0,
      todayConsumption: 1.2,
      peakDetected: false,
    },
    {
      id: "3",
      name: "Frigorífico",
      room: "Cozinha",
      status: true,
      currentPower: 150,
      todayConsumption: 2.1,
      peakDetected: false,
    },
    {
      id: "4",
      name: "PC Desktop",
      room: "Escritório",
      status: true,
      currentPower: 250,
      todayConsumption: 1.8,
      peakDetected: false,
    },
  ]);

  const togglePlug = (id: string) => {
    setPlugs(plugs.map(plug => 
      plug.id === id 
        ? { ...plug, status: !plug.status, currentPower: !plug.status ? plug.currentPower : 0 }
        : plug
    ));
  };

  const totalPower = plugs.reduce((sum, plug) => sum + (plug.status ? plug.currentPower : 0), 0);
  const totalConsumption = plugs.reduce((sum, plug) => sum + plug.todayConsumption, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartPlug Connect</h1>
        <p className="text-gray-600">Gestão inteligente dos seus dispositivos IoT</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Power className="text-blue-600" size={24} />
            <span className="text-2xl font-bold text-gray-900">{totalPower}W</span>
          </div>
          <p className="text-sm text-gray-600">Potência Atual</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-green-600" size={24} />
            <span className="text-2xl font-bold text-gray-900">{totalConsumption.toFixed(1)} kWh</span>
          </div>
          <p className="text-sm text-gray-600">Consumo Hoje</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Plug className="text-purple-600" size={24} />
            <span className="text-2xl font-bold text-gray-900">{plugs.filter(p => p.status).length}/{plugs.length}</span>
          </div>
          <p className="text-sm text-gray-600">Dispositivos Ativos</p>
        </div>
      </div>

      {/* Peak Alert */}
      {plugs.some(p => p.peakDetected) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-orange-900 mb-1">Pico de Consumo Detectado!</h4>
            <p className="text-sm text-orange-800">
              O Ar Condicionado está a consumir acima do normal. Considere ajustar a temperatura ou agendar o uso para fora do horário de ponta.
            </p>
          </div>
        </div>
      )}

      {/* Smart Plugs List */}
      <div className="space-y-4">
        {plugs.map((plug) => (
          <div
            key={plug.id}
            className={`bg-white rounded-xl shadow-md p-6 border transition-all ${
              plug.peakDetected ? "border-orange-300 bg-orange-50/30" : "border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  plug.status ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  <Plug size={24} className={plug.status ? "text-blue-600" : "text-gray-400"} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{plug.name}</h3>
                  <p className="text-sm text-gray-600">{plug.room}</p>
                </div>
              </div>
              <Switch
                checked={plug.status}
                onCheckedChange={() => togglePlug(plug.id)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Estado</p>
                <p className={`font-semibold ${plug.status ? "text-green-600" : "text-gray-400"}`}>
                  {plug.status ? "Ligado" : "Desligado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Potência</p>
                <p className="font-semibold text-gray-900">{plug.currentPower}W</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Consumo Hoje</p>
                <p className="font-semibold text-gray-900">{plug.todayConsumption} kWh</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Custo Est.</p>
                <p className="font-semibold text-gray-900">€{(plug.todayConsumption * 0.18).toFixed(2)}</p>
              </div>
            </div>

            {plug.peakDetected && (
              <div className="mt-4 flex items-center gap-2 text-sm text-orange-700">
                <AlertTriangle size={16} />
                <span>Pico de consumo detectado</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scheduling Suggestion */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mt-6">
        <div className="flex items-start gap-3">
          <Clock className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">💡 Sugestão de Agendamento</h4>
            <p className="text-sm text-blue-800 mb-3">
              Economize até 30% programando dispositivos de alto consumo fora do horário de ponta (18h-21h)
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Configurar Agendamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

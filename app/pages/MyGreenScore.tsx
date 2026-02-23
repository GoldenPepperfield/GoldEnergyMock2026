import { Leaf, TreePine, Cloud, Droplet } from "lucide-react";
import { Progress } from "../components/ui/progress";

export function MyGreenScore() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MyGreen Score</h1>
        <p className="text-gray-600">O seu impacto ambiental mensal</p>
      </div>

      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-2xl p-8 mb-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 rounded-full mb-4">
            <Leaf size={64} />
          </div>
          <h2 className="text-5xl font-bold mb-2">87/100</h2>
          <p className="text-xl opacity-90">Excelente! Continue assim!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <Cloud size={32} className="mb-2" />
            <p className="text-2xl font-bold">142 kg</p>
            <p className="text-sm opacity-90">CO₂ Evitado</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <TreePine size={32} className="mb-2" />
            <p className="text-2xl font-bold">7.2</p>
            <p className="text-sm opacity-90">Árvores Equivalentes</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <Leaf size={32} className="mb-2" />
            <p className="text-2xl font-bold">87%</p>
            <p className="text-sm opacity-90">Energia Verde</p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Análise Detalhada</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Consumo Responsável</span>
              <span className="text-sm font-semibold text-green-600">92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Uso de Renováveis</span>
              <span className="text-sm font-semibold text-green-600">87%</span>
            </div>
            <Progress value={87} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Eficiência Energética</span>
              <span className="text-sm font-semibold text-green-600">78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Mobilidade Verde</span>
              <span className="text-sm font-semibold text-yellow-600">65%</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Dicas para Melhorar</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Reduza o consumo em horário de ponta (18h-21h)</li>
          <li>• Considere instalar painéis solares (veja SolarMatch)</li>
          <li>• Use transportes públicos 2x por semana para ganhar pontos</li>
          <li>• Configure alertas no SmartPlug para otimizar consumo</li>
        </ul>
      </div>

      {/* Historical Data */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Histórico de Pontuação</h3>
        <div className="flex items-end justify-between h-48 gap-2">
          {[72, 75, 78, 81, 84, 87].map((score, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500"
                style={{ height: `${score}%` }}
              />
              <span className="text-xs text-gray-600 mt-2">
                {new Date(2026, 1 - index, 1).toLocaleDateString('pt-PT', { month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

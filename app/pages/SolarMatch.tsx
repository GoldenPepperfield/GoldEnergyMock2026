import { useState } from "react";
import { Sun, Home, TrendingUp, DollarSign, Leaf, Calculator } from "lucide-react";
import { Slider } from "../components/ui/slider";

export function SolarMatch() {
  const [houseSize, setHouseSize] = useState([120]);
  const [residents, setResidents] = useState([3]);
  const [monthlyBill, setMonthlyBill] = useState([80]);

  const calculateSolar = () => {
    const avgConsumption = monthlyBill[0] / 0.18; // Assuming €0.18/kWh
    const recommendedPanels = Math.ceil(avgConsumption / 30); // ~30 kWh per panel per month
    const systemCost = recommendedPanels * 450; // €450 per panel
    const monthlyGeneration = recommendedPanels * 30;
    const selfSufficiency = Math.min((monthlyGeneration / avgConsumption) * 100, 95);
    const monthlySavings = (monthlyGeneration * 0.18) * (selfSufficiency / 100);
    const paybackYears = systemCost / (monthlySavings * 12);
    const co2Saved = (monthlyGeneration * 12 * 0.4) / 1000; // tons per year

    return {
      recommendedPanels,
      systemCost,
      monthlyGeneration,
      selfSufficiency,
      monthlySavings,
      paybackYears,
      co2Saved,
    };
  };

  const results = calculateSolar();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SolarMatch</h1>
        <p className="text-gray-600">Simulador inteligente de painéis solares para sua casa</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="text-orange-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-900">Configure a Simulação</h2>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">Área da Casa (m²)</label>
              <span className="text-lg font-bold text-gray-900">{houseSize[0]} m²</span>
            </div>
            <Slider
              value={houseSize}
              onValueChange={setHouseSize}
              min={50}
              max={300}
              step={10}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">Número de Residentes</label>
              <span className="text-lg font-bold text-gray-900">{residents[0]} pessoas</span>
            </div>
            <Slider
              value={residents}
              onValueChange={setResidents}
              min={1}
              max={8}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">Fatura Mensal Média</label>
              <span className="text-lg font-bold text-gray-900">€{monthlyBill[0]}</span>
            </div>
            <Slider
              value={monthlyBill}
              onValueChange={setMonthlyBill}
              min={20}
              max={300}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-2xl p-8 mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Sun size={32} />
          <h2 className="text-2xl font-bold">Sistema Recomendado</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <Home size={28} className="mb-2" />
            <p className="text-3xl font-bold">{results.recommendedPanels}</p>
            <p className="text-sm opacity-90">Painéis Solares</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <DollarSign size={28} className="mb-2" />
            <p className="text-3xl font-bold">€{results.systemCost.toLocaleString()}</p>
            <p className="text-sm opacity-90">Investimento Total</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <TrendingUp size={28} className="mb-2" />
            <p className="text-3xl font-bold">{results.selfSufficiency.toFixed(0)}%</p>
            <p className="text-sm opacity-90">Autossuficiência</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <Leaf size={28} className="mb-2" />
            <p className="text-3xl font-bold">{results.co2Saved.toFixed(1)}t</p>
            <p className="text-sm opacity-90">CO₂ Evitado/ano</p>
          </div>
        </div>
      </div>

      {/* Financial Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 Análise Financeira</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">Geração Mensal</span>
              <span className="font-bold text-gray-900">{results.monthlyGeneration} kWh</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">Poupança Mensal</span>
              <span className="font-bold text-green-600">€{results.monthlySavings.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">Poupança Anual</span>
              <span className="font-bold text-green-600">€{(results.monthlySavings * 12).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">Retorno do Investimento</span>
              <span className="font-bold text-orange-600">{results.paybackYears.toFixed(1)} anos</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Poupança em 25 anos</span>
              <span className="font-bold text-blue-600">€{(results.monthlySavings * 12 * 25).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🌍 Impacto Ambiental</h3>
          
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="text-green-600" size={20} />
                <span className="font-semibold text-green-900">CO₂ Evitado</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{results.co2Saved.toFixed(1)} toneladas/ano</p>
              <p className="text-sm text-green-600 mt-1">
                Equivalente a plantar {Math.round(results.co2Saved * 50)} árvores
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="text-blue-600" size={20} />
                <span className="font-semibold text-blue-900">Energia Limpa</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{(results.monthlyGeneration * 12).toLocaleString()} kWh/ano</p>
              <p className="text-sm text-blue-600 mt-1">
                100% renovável e sustentável
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Home className="text-orange-600" size={20} />
                <span className="font-semibold text-orange-900">Autossuficiência</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{results.selfSufficiency.toFixed(0)}%</p>
              <p className="text-sm text-orange-600 mt-1">
                Independência energética
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📅 Linha do Tempo de Poupança</h3>
        <div className="space-y-3">
          {[1, 5, 10, 15, 20, 25].map((year) => {
            const totalSavings = results.monthlySavings * 12 * year - results.systemCost;
            const isBreakeven = year >= Math.ceil(results.paybackYears);
            
            return (
              <div key={year} className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isBreakeven ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  <span className="font-bold">{year}a</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {isBreakeven ? `Lucro acumulado` : `Investindo`}
                    </span>
                    <span className={`font-bold ${
                      totalSavings > 0 ? "text-green-600" : "text-orange-600"
                    }`}>
                      €{Math.abs(totalSavings).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isBreakeven ? "bg-green-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${Math.min((year / 25) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-8 border border-orange-200">
        <div className="text-center">
          <Sun size={48} className="text-orange-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Pronto para Começar?</h3>
          <p className="text-gray-700 mb-6">
            Contacte-nos para uma avaliação técnica gratuita e orçamento personalizado
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
              Solicitar Orçamento
            </button>
            <button className="bg-white text-orange-700 border-2 border-orange-600 px-8 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors">
              Falar com Especialista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

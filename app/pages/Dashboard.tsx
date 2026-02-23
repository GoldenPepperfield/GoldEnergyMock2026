import { Link } from "react-router";
import { Leaf, Plug, TrendingUp, Award, MessageCircle, Heart, Sun, Zap, ArrowRight, BarChart2, BrainCircuit, Sparkles } from "lucide-react";

export function Dashboard() {
  const otherFeatures = [
    { to: "/mygreen-score", icon: Leaf, label: "MyGreen Score", desc: "Cálculo do seu impacto ambiental", color: "bg-green-100 text-green-600" },
    { to: "/smartplug", icon: Plug, label: "SmartPlug Connect", desc: "Gestão de tomadas inteligentes", color: "bg-blue-100 text-[#3B7DB7]" },
    { to: "/rewards", icon: Award, label: "GoldRewards", desc: "Pontos e badges sustentáveis", color: "bg-yellow-100 text-yellow-600" },
    { to: "/chatbot", icon: MessageCircle, label: "Energy Chatbot", desc: "Assistente para faturas", color: "bg-indigo-100 text-indigo-600" },
    { to: "/goldcare", icon: Heart, label: "GoldCare", desc: "Monitorização de famílias vulneráveis", color: "bg-red-100 text-red-500" },
    { to: "/solar", icon: Sun, label: "SolarMatch", desc: "Simulador de painéis solares", color: "bg-orange-100 text-orange-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">

      {/* Hero welcome */}
      <div className="bg-gradient-to-r from-[#3B7DB7] to-[#1a5c96] rounded-2xl p-8 text-white shadow-xl">
        <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-1">Bem-vindo de volta</p>
        <h1 className="text-3xl font-bold mb-1">Gold Energy</h1>
        <p className="text-blue-100 opacity-90 mb-6">Eletricidade 100% verde para um futuro sustentável</p>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/15 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Leaf size={16} className="text-green-300" />
              <span className="text-xs text-blue-200">Energia Verde</span>
            </div>
            <p className="text-2xl font-bold">87%</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-yellow-300" />
              <span className="text-xs text-blue-200">Consumo Mensal</span>
            </div>
            <p className="text-2xl font-bold">234 kWh</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award size={16} className="text-yellow-300" />
              <span className="text-xs text-blue-200">Pontos Gold</span>
            </div>
            <p className="text-2xl font-bold">1,250</p>
          </div>
        </div>
      </div>

      {/* PowerPredict Feature Spotlight */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-500" />
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-widest">Destaque</span>
        </div>
        <Link
          to="/powerpredict"
          className="group block bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp size={28} />
                </div>
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">IA Preditiva</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">PowerPredict</h2>
              <p className="text-purple-100 text-base mb-6 max-w-md">
                Antecipa o teu consumo elétrico com inteligência artificial. Recebe previsões personalizadas, alertas de poupança e recomendações para reduzir a fatura.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/15 rounded-xl p-3 text-center">
                  <BarChart2 size={20} className="mx-auto mb-1 text-purple-200" />
                  <p className="text-xs text-purple-200">Previsão de consumo</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-center">
                  <BrainCircuit size={20} className="mx-auto mb-1 text-purple-200" />
                  <p className="text-xs text-purple-200">Modelo de IA</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-center">
                  <Zap size={20} className="mx-auto mb-1 text-purple-200" />
                  <p className="text-xs text-purple-200">Alertas de picos</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-5 py-2.5 rounded-xl group-hover:bg-purple-50 transition-colors">
                Explorar PowerPredict
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Other Features */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Outras funcionalidades</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {otherFeatures.map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-100 flex flex-col items-center text-center gap-2"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">{label}</p>
              <p className="text-xs text-gray-400 leading-tight hidden md:block">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

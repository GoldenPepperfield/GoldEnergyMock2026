import { Link } from "react-router";
import { Leaf, Plug, TrendingUp, Award, MessageCircle, Heart, Sun, Zap } from "lucide-react";

export function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo à Gold Energy</h1>
        <p className="text-gray-600">Eletricidade 100% VERDE</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Leaf size={32} />
            <span className="text-2xl font-bold">87%</span>
          </div>
          <p className="text-sm opacity-90">Energia Verde</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Zap size={32} />
            <span className="text-2xl font-bold">234 kWh</span>
          </div>
          <p className="text-sm opacity-90">Consumo Mensal</p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-400 to-pink-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Award size={32} />
            <span className="text-2xl font-bold">1,250</span>
          </div>
          <p className="text-sm opacity-90">Pontos Gold</p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        <Link
          to="/mygreen-score"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Leaf size={24} className="text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">MyGreen Score</h3>
          <p className="text-sm text-gray-600">
            Cálculo do seu impacto ambiental
          </p>
        </Link>

        <Link
          to="/smartplug"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Plug size={24} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">SmartPlug Connect</h3>
          <p className="text-sm text-gray-600">
            Gestão de tomadas inteligentes
          </p>
        </Link>

        <Link
          to="/powerpredict"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">PowerPredict</h3>
          <p className="text-sm text-gray-600">
            Previsão de consumo e custos
          </p>
        </Link>

        <Link
          to="/rewards"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <Award size={24} className="text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">GoldRewards</h3>
          <p className="text-sm text-gray-600">
            Pontos e badges por comportamento sustentável
          </p>
        </Link>

        <Link
          to="/chatbot"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle size={24} className="text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Energy Chatbot</h3>
          <p className="text-sm text-gray-600">
            Assistente para dúvidas sobre faturas
          </p>
        </Link>

        <Link
          to="/goldcare"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <Heart size={24} className="text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">GoldCare</h3>
          <p className="text-sm text-gray-600">
            Monitorização de consumo de famílias vulneráveis
          </p>
        </Link>

        <Link
          to="/solar"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Sun size={24} className="text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">SolarMatch</h3>
          <p className="text-sm text-gray-600">
            Simulador de painéis solares
          </p>
        </Link>
      </div>
    </div>
  );
}

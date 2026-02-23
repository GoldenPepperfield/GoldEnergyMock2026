import { Award, Star, Trophy, Gift, TrendingUp, CheckCircle } from "lucide-react";
import { Progress } from "../components/ui/progress";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  total: number;
  completed: boolean;
}

export function GoldRewards() {
  const userPoints = 1250;
  const nextRewardAt = 1500;
  const progressToNextReward = (userPoints / nextRewardAt) * 100;

  const badges: Badge[] = [
    {
      id: "1",
      name: "Eco Warrior",
      description: "Use 90% energia verde por 1 mês",
      icon: "🌱",
      earned: true,
      earnedDate: "15 Jan 2026",
    },
    {
      id: "2",
      name: "Energy Saver",
      description: "Reduza consumo em 20%",
      icon: "⚡",
      earned: true,
      earnedDate: "02 Fev 2026",
    },
    {
      id: "3",
      name: "Smart User",
      description: "Configure 5 SmartPlugs",
      icon: "🔌",
      earned: true,
      earnedDate: "10 Fev 2026",
    },
    {
      id: "4",
      name: "Solar Pioneer",
      description: "Instale painéis solares",
      icon: "☀️",
      earned: false,
    },
    {
      id: "5",
      name: "Green Commuter",
      description: "30 dias de mobilidade verde",
      icon: "🚴",
      earned: false,
    },
    {
      id: "6",
      name: "Power Predictor",
      description: "Siga previsões por 7 dias",
      icon: "📊",
      earned: true,
      earnedDate: "20 Fev 2026",
    },
  ];

  const challenges: Challenge[] = [
    {
      id: "1",
      title: "Leituras Regulares",
      description: "Faça 4 leituras este mês",
      points: 100,
      progress: 3,
      total: 4,
      completed: false,
    },
    {
      id: "2",
      title: "Redução de Consumo",
      description: "Reduza 15% vs mês anterior",
      points: 250,
      progress: 12,
      total: 15,
      completed: false,
    },
    {
      id: "3",
      title: "Horário Fora de Ponta",
      description: "80% consumo fora de pico",
      points: 150,
      progress: 80,
      total: 80,
      completed: true,
    },
    {
      id: "4",
      title: "Chatbot Engagement",
      description: "Interaja com chatbot 5 vezes",
      points: 50,
      progress: 5,
      total: 5,
      completed: true,
    },
  ];

  const rewards = [
    { id: "1", name: "Desconto 5€ na fatura", points: 500, available: true },
    { id: "2", name: "Desconto 10€ na fatura", points: 1000, available: true },
    { id: "3", name: "Lâmpadas LED grátis", points: 1500, available: false },
    { id: "4", name: "Desconto 20€ na fatura", points: 2000, available: false },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GoldRewards</h1>
        <p className="text-gray-600">Ganhe pontos por comportamentos sustentáveis</p>
      </div>

      {/* Points Summary */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-2xl p-8 mb-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-lg opacity-90 mb-2">Seus Pontos</p>
            <p className="text-5xl font-bold flex items-center gap-3">
              <Trophy size={48} />
              {userPoints}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90 mb-1">Próxima Recompensa</p>
            <p className="text-2xl font-bold">{nextRewardAt} pts</p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso</span>
            <span>{userPoints} / {nextRewardAt}</span>
          </div>
          <Progress value={progressToNextReward} className="h-3 bg-yellow-500/30" />
        </div>
      </div>

      {/* Active Challenges */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Desafios Ativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`bg-white rounded-xl shadow-md p-6 border ${
                challenge.completed ? "border-green-300 bg-green-50/30" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{challenge.title}</h3>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </div>
                {challenge.completed && (
                  <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                )}
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-semibold text-gray-900">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
                <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recompensa</span>
                <span className="font-bold text-yellow-600 flex items-center gap-1">
                  <Star size={16} fill="currentColor" />
                  {challenge.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Badges Conquistados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`text-center p-4 rounded-xl border-2 transition-all ${
                badge.earned
                  ? "bg-white border-yellow-400 shadow-md"
                  : "bg-gray-50 border-gray-200 opacity-50"
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <h4 className="font-semibold text-sm text-gray-900 mb-1">{badge.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
              {badge.earned && badge.earnedDate && (
                <p className="text-xs text-green-600 font-medium">{badge.earnedDate}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Rewards */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Gift size={28} className="text-pink-600" />
          Recompensas Disponíveis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`border rounded-xl p-6 ${
                reward.available
                  ? "border-pink-300 bg-pink-50/30"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                <span className="font-bold text-yellow-600 flex items-center gap-1">
                  <Star size={16} fill="currentColor" />
                  {reward.points}
                </span>
              </div>
              <button
                disabled={!reward.available}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  reward.available
                    ? "bg-pink-600 text-white hover:bg-pink-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {reward.available ? "Resgatar" : "Bloqueado"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Teaser */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">🏆 Ranking Mensal</h3>
            <p className="text-sm text-gray-600">Você está em #47 de 1,234 utilizadores</p>
            <p className="text-sm text-blue-600 font-medium mt-1">↑ Subiu 12 posições esta semana!</p>
          </div>
          <TrendingUp size={48} className="text-blue-600" />
        </div>
      </div>
    </div>
  );
}

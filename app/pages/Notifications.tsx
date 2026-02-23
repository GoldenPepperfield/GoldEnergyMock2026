import { Bell, AlertTriangle, CheckCircle, Info, Gift, TrendingDown } from "lucide-react";

interface Notification {
  id: string;
  type: "alert" | "success" | "info" | "reward";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function Notifications() {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "alert",
      title: "Pico de Consumo Detectado",
      message: "O ar condicionado registou um consumo acima do normal. Considere ajustar a temperatura.",
      timestamp: "Há 2 horas",
      read: false,
    },
    {
      id: "2",
      type: "success",
      title: "Novo Badge Conquistado!",
      message: "Parabéns! Ganhou o badge 'Power Predictor' por seguir as previsões durante 7 dias.",
      timestamp: "Há 5 horas",
      read: false,
    },
    {
      id: "3",
      type: "info",
      title: "Fatura Disponível",
      message: "A sua fatura de Fevereiro já está disponível. Valor: €44.10. Vence em 5 dias.",
      timestamp: "Ontem",
      read: false,
    },
    {
      id: "4",
      type: "reward",
      title: "Pontos Gold Adicionados",
      message: "Ganhou +150 pontos por reduzir o consumo em 15% este mês!",
      timestamp: "Há 2 dias",
      read: true,
    },
    {
      id: "5",
      type: "info",
      title: "Previsão de Consumo",
      message: "Baseado no seu histórico, prevê-se um consumo de 8.5 kWh para hoje.",
      timestamp: "Há 2 dias",
      read: true,
    },
    {
      id: "6",
      type: "alert",
      title: "Alerta GoldCare",
      message: "João Santos apresenta padrão de consumo anormal. Verifique o bem-estar.",
      timestamp: "Há 3 dias",
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="text-orange-600" size={24} />;
      case "success":
        return <CheckCircle className="text-green-600" size={24} />;
      case "info":
        return <Info className="text-blue-600" size={24} />;
      case "reward":
        return <Gift className="text-pink-600" size={24} />;
      default:
        return <Bell className="text-gray-600" size={24} />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return "bg-gray-50 border-gray-200";
    
    switch (type) {
      case "alert":
        return "bg-orange-50 border-orange-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      case "reward":
        return "bg-pink-50 border-pink-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificações</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Todas as notificações lidas"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-xl border p-4 transition-all hover:shadow-md ${getBgColor(
              notification.type,
              notification.read
            )}`}
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  {!notification.read && (
                    <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2" />
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                <span className="text-xs text-gray-500">{notification.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configurações de Notificações</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-orange-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Alertas de Consumo</p>
                <p className="text-xs text-gray-600">Picos e padrões anormais</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Gift className="text-pink-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Recompensas</p>
                <p className="text-xs text-gray-600">Pontos e badges</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Info className="text-blue-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Faturas</p>
                <p className="text-xs text-gray-600">Disponibilidade e vencimentos</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingDown className="text-green-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Dicas de Poupança</p>
                <p className="text-xs text-gray-600">Sugestões personalizadas</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

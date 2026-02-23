import { User, Mail, Phone, MapPin, Settings, CreditCard, FileText, LogOut } from "lucide-react";

export function Profile() {
  const userInfo = {
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    phone: "+351 912 345 678",
    address: "Rua das Flores, 123, 1200-001 Lisboa",
    contractNumber: "GE-2024-45678",
    tariff: "Gold Verde Bi-Horário",
    points: 1250,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Perfil</h1>
        <p className="text-gray-600">Gerir as suas informações e preferências</p>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-8 mb-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
            {userInfo.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{userInfo.name}</h2>
            <p className="text-blue-100 mb-3">Cliente Gold Energy desde 2024</p>
            <div className="flex items-center gap-4">
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm backdrop-blur-sm">
                {userInfo.points} Pontos Gold
              </span>
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm backdrop-blur-sm">
                {userInfo.tariff}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Informação Pessoal</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <Settings size={16} />
            Editar
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <User className="text-gray-600 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Nome Completo</p>
              <p className="font-semibold text-gray-900">{userInfo.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <Mail className="text-gray-600 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{userInfo.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <Phone className="text-gray-600 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Telefone</p>
              <p className="font-semibold text-gray-900">{userInfo.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <MapPin className="text-gray-600 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Morada</p>
              <p className="font-semibold text-gray-900">{userInfo.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Information */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Informação do Contrato</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <FileText className="text-gray-600 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Número do Contrato</p>
              <p className="font-semibold text-gray-900">{userInfo.contractNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <CreditCard className="text-gray-600 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Plano Tarifário</p>
              <p className="font-semibold text-gray-900">{userInfo.tariff}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <Settings className="text-gray-600 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Estado do Contrato</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                Ativo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings size={24} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Preferências</h4>
              <p className="text-sm text-gray-600">Configurar notificações e alertas</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard size={24} className="text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Métodos de Pagamento</h4>
              <p className="text-sm text-gray-600">Gerir formas de pagamento</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Documentos</h4>
              <p className="text-sm text-gray-600">Faturas e contratos</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Mail size={24} className="text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Suporte</h4>
              <p className="text-sm text-gray-600">Contactar apoio ao cliente</p>
            </div>
          </div>
        </button>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Segurança</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <p className="font-medium text-gray-900">Alterar Password</p>
            <p className="text-sm text-gray-600">Última alteração há 3 meses</p>
          </button>
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <p className="font-medium text-gray-900">Autenticação de Dois Fatores</p>
            <p className="text-sm text-gray-600">Adicionar camada extra de segurança</p>
          </button>
        </div>
      </div>

      {/* Logout */}
      <button className="w-full bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium">
        <LogOut size={20} />
        Terminar Sessão
      </button>

      {/* App Version */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Gold Energy App v2.5.0
      </p>
    </div>
  );
}

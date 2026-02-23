import { useState } from "react";
import { Send, Bot, User, Lightbulb } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export function EnergyChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Olá! 👋 Sou o assistente Gold Energy. Como posso ajudar hoje?",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: "2",
      sender: "bot",
      text: "Posso ajudar com: faturas, consumo, dicas de poupança, tarifas, e muito mais!",
      timestamp: new Date(Date.now() - 118000),
    },
  ]);
  
  const [inputText, setInputText] = useState("");

  const quickQuestions = [
    "Qual é o meu consumo este mês?",
    "Como poupar energia?",
    "Quando vence a próxima fatura?",
    "Qual a minha tarifa atual?",
  ];

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("consumo") || lowerMessage.includes("gastar")) {
      return "O seu consumo este mês é de 234 kWh, aproximadamente 12% inferior ao mês passado. Excelente! 📊 Continue assim para manter a poupança.";
    }
    
    if (lowerMessage.includes("poupar") || lowerMessage.includes("economizar") || lowerMessage.includes("dicas")) {
      return "Aqui estão 3 dicas para poupar:\n\n1. ⚡ Evite horário de ponta (18h-21h)\n2. 🔌 Desligue aparelhos em standby\n3. 🌡️ Ajuste o AC para 24°C\n\nPode poupar até €15/mês!";
    }
    
    if (lowerMessage.includes("fatura") || lowerMessage.includes("pagar") || lowerMessage.includes("vence")) {
      return "A sua próxima fatura vence em 5 dias (28 de Fevereiro). O valor estimado é €44.10. Pode pagar através do MB WAY ou referência multibanco. 💳";
    }
    
    if (lowerMessage.includes("tarifa") || lowerMessage.includes("preço")) {
      return "Está atualmente no plano 'Gold Verde Bi-Horário':\n\n🌙 Vazio: €0.12/kWh\n☀️ Fora Ponta: €0.18/kWh\n⚡ Ponta: €0.25/kWh\n\nQuer simular uma mudança de tarifa?";
    }
    
    if (lowerMessage.includes("painéis") || lowerMessage.includes("solar")) {
      return "Ótima ideia! 🌞 Baseado no seu perfil de consumo, um sistema de 4 painéis pode gerar 60% da sua energia. Visite o SolarMatch para uma simulação personalizada!";
    }
    
    return "Entendo! Para informação mais específica sobre isso, pode contactar o nosso suporte em apoio@goldenergy.pt ou ligar 800 100 100. Posso ajudar em mais alguma coisa? 😊";
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText("");

    // Simulate bot typing delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: getBotResponse(inputText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Energy Chatbot</h1>
        <p className="text-gray-600">Assistente inteligente para suas dúvidas sobre energia</p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-semibold">Assistente Gold Energy</h3>
            <p className="text-sm opacity-90">Online • Responde em segundos</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-6 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 mb-4 ${
                message.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === "user" ? "bg-blue-600" : "bg-green-600"
                }`}
              >
                {message.sender === "user" ? (
                  <User size={18} className="text-white" />
                ) : (
                  <Bot size={18} className="text-white" />
                )}
              </div>
              <div
                className={`max-w-[70%] ${
                  message.sender === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`rounded-2xl p-4 inline-block ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Questions */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Perguntas frequentes:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escreva a sua mensagem..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-2">📊 Faturas</h4>
          <p className="text-sm text-blue-800">
            Consulte, entenda e pague suas faturas
          </p>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <h4 className="font-semibold text-green-900 mb-2">💡 Dicas</h4>
          <p className="text-sm text-green-800">
            Receba sugestões personalizadas de poupança
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <h4 className="font-semibold text-purple-900 mb-2">⚙️ Tarifas</h4>
          <p className="text-sm text-purple-800">
            Simule e compare planos de energia
          </p>
        </div>
      </div>
    </div>
  );
}

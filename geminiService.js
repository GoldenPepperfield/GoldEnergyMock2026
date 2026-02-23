import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analisarDadosERecomendar = async (dispositivos, temperatura) => {
  // Usamos o flash por ser mais rápido e gratuito
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } 
  });

  const prompt = `
    Contexto: Smart Home Energy Advisor.
    Dados: Temperatura externa ${temperatura}ºC, Consumo atual: ${JSON.stringify(dispositivos)}.
    Tarefa: Dá uma recomendação curta e espontânea para poupar energia.
    Responde em JSON: {"recomendacao": "string", "urgencia": "baixa|media|alta"}
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Erro na API:", error);
    return { recomendacao: "Erro ao obter sugestão." };
  }
};
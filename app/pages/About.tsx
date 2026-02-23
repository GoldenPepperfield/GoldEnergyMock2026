import { Link } from "react-router";
import {
  TrendingUp, Thermometer, Cloud, Clock, BarChart2, Zap,
  Activity, DollarSign, Info, ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────
// Small helper card
// ─────────────────────────────────────────────
function Section({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${accent}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0">{icon}</div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      <div className="text-sm text-gray-700 space-y-2 leading-relaxed">{children}</div>
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/60 border border-white/80 rounded-xl px-4 py-3 font-mono text-sm text-purple-800 my-3 overflow-x-auto">
      {children}
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
        {n}
      </span>
      <span>{children}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Breadcrumb ───────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/powerpredict" className="hover:text-purple-600 transition-colors font-medium">
          PowerPredict
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-semibold">Sobre o Algoritmo</span>
      </div>

      {/* ── Hero ─────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-800 text-white rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <Info size={26} />
          <h1 className="text-2xl font-bold">Como funciona o PowerPredict?</h1>
        </div>
        <p className="text-purple-100 text-sm leading-relaxed max-w-2xl">
          O PowerPredict combina <strong>padrões históricos de consumo</strong>,{" "}
          <strong>dados meteorológicos em tempo real</strong> e{" "}
          <strong>tendências da rede elétrica nacional</strong> para gerar previsões
          de consumo diário e horário para os próximos 7 dias.
        </p>
      </div>

      {/* ── Visão Geral do Pipeline ───────────────────── */}
      <Section
        icon={<BarChart2 size={22} className="text-purple-600" />}
        title="Visão Geral do Processo"
        accent="bg-purple-50 border-purple-100"
      >
        <p>
          O algoritmo executa os seguintes passos por esta ordem sempre que a página é carregada
          ou os dados meteorológicos são atualizados:
        </p>
        <div className="space-y-2 mt-3">
          <Step n={1}>Leitura e agregação do histórico de consumo (leituras horárias em kWh).</Step>
          <Step n={2}>Cálculo das médias por dia da semana e do perfil horário normalizado.</Step>
          <Step n={3}>Estimativa do fator de tendência recente (últimos 7 vs. 7 anteriores).</Step>
          <Step n={4}>Obtenção da previsão meteorológica (Open-Meteo) e cálculo dos fatores climáticos.</Step>
          <Step n={5}>Aplicação do fator macro da Rede Nacional (REN Datahub).</Step>
          <Step n={6}>Geração das previsões diárias (7 dias) e horárias (amanhã, 24 h).</Step>
          <Step n={7}>Cálculo do custo estimado com base na tarifa bi-horária.</Step>
        </div>
      </Section>

      {/* ── Histórico ────────────────────────────────── */}
      <Section
        icon={<Clock size={22} className="text-blue-600" />}
        title="1 · Análise do Histórico de Consumo"
        accent="bg-blue-50 border-blue-100"
      >
        <p>
          O sistema carrega um ficheiro JSON com centenas de leituras horárias de consumo
          (campos <code className="bg-blue-100 rounded px-1">timestamp</code> e{" "}
          <code className="bg-blue-100 rounded px-1">kwh</code>). Cada leitura é
          agregada por dia e por hora do dia.
        </p>
        <p className="mt-2">
          Para cada <strong>dia da semana</strong> (segunda a domingo) é calculada a
          média histórica de consumo diário total — designada{" "}
          <code className="bg-blue-100 rounded px-1">dowAvg[dow]</code> — onde{" "}
          <em>dow</em> é o índice 0–6 do dia da semana.
        </p>
        <p className="mt-2">
          Paralelamente, constrói-se um <strong>perfil horário normalizado</strong>: a
          fração de energia tipicamente consumida em cada hora do dia (0–23 h), somando
          sempre 1. Este perfil captura padrões como o pico matinal ou o uso intenso
          ao final do dia.
        </p>
      </Section>

      {/* ── Tendência ────────────────────────────────── */}
      <Section
        icon={<TrendingUp size={22} className="text-green-600" />}
        title="2 · Fator de Tendência Recente"
        accent="bg-green-50 border-green-100"
      >
        <p>
          Para detetar se o consumo está a aumentar ou a diminuir face ao padrão
          histórico, o algoritmo compara as <strong>últimas duas semanas</strong>:
        </p>
        <Formula>
          trendFactor = média(últimos 7 dias) / média(7 dias anteriores)
        </Formula>
        <p>
          Se o consumo subiu 5 % na última semana, <code>trendFactor = 1.05</code>; se
          desceu 3 %, fica em <code>0.97</code>. Este fator é multiplicado por todas as
          previsões futuras, fazendo com que o modelo se adapte rapidamente a alterações
          de comportamento (ex.: chegada do inverno, férias, novos equipamentos).
        </p>
      </Section>

      {/* ── Fatores Climáticos ────────────────────────── */}
      <Section
        icon={<Thermometer size={22} className="text-orange-600" />}
        title="3 · Fatores Climáticos (Open-Meteo)"
        accent="bg-orange-50 border-orange-100"
      >
        <p>
          Os dados meteorológicos são obtidos da API gratuita{" "}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noreferrer"
            className="underline text-orange-700"
          >
            Open-Meteo
          </a>{" "}
          para a localização do utilizador (via Geolocation API, com fallback para
          coordenadas de Portugal). São usadas duas variáveis para cada dia previsto:
        </p>

        <div className="mt-3 space-y-4">
          <div>
            <p className="font-semibold text-orange-700">Fator Térmico</p>
            <p>
              Baseia-se na <em>temperatura de sensação térmica</em> (apparent temperature).
              A temperatura de conforto de referência é <strong>18 °C</strong>: abaixo dessa
              temperatura o aquecimento aumenta o consumo; acima, o arrefecimento faz o mesmo.
            </p>
            <Formula>
              thermalFactor = 1 + |apparentTemp − 18| × 0.02
            </Formula>
            <p>
              Exemplos: 28 °C → ×1.20; 5 °C → ×1.26; 18 °C → ×1.00 (neutro).
            </p>
          </div>

          <div>
            <p className="font-semibold text-orange-700">Fator de Condições Atmosféricas</p>
            <p>
              A precipitação e a humidade relativa também influenciam o consumo (maior
              permanência em casa, uso de secadores, etc.):
            </p>
            <Formula>
              {`precipMm > 15 mm → ×1.08
precipMm >  5 mm → ×1.05
precipMm >  1 mm → ×1.03
humidade > 80 %  → ×1.02
caso contrário   → ×1.00`}
            </Formula>
          </div>
        </div>

        <p className="mt-3">
          Para os dias em que não há dados da API (ex.: API indisponível ou fora do
          horizonte de previsão), o algoritmo utiliza <strong>médias mensais sazonais</strong>{" "}
          pré-definidas para Portugal (ex.: Janeiro ≈ 11 °C, Julho ≈ 27 °C).
        </p>
      </Section>

      {/* ── Previsão Diária ───────────────────────────── */}
      <Section
        icon={<Cloud size={22} className="text-cyan-600" />}
        title="4 · Cálculo da Previsão Diária (7 dias)"
        accent="bg-cyan-50 border-cyan-100"
      >
        <p>Para cada um dos 7 dias futuros, a previsão central é:</p>
        <Formula>
          previsto = dowAvg[dow] × trendFactor × thermalFactor × condFactor
        </Formula>
        <p>
          Adicionalmente, é calculado um <strong>intervalo de confiança</strong> com base
          no desvio padrão histórico (<em>stdDev</em>):
        </p>
        <Formula>
          {`limite inferior = max(0, previsto − stdDev × 0.8)
limite superior = previsto + stdDev × 0.8`}
        </Formula>
        <p>
          O <strong>nível de confiança</strong> exibido (60–95 %) é inversamente
          proporcional ao afastamento do fator de tendência em relação a 1.0 — quanto
          mais estável o consumo histórico, maior a confiança:
        </p>
        <Formula>confiança = clamp(95 − |trendFactor − 1| × 100, 60, 95) %</Formula>
      </Section>

      {/* ── Previsão Horária ──────────────────────────── */}
      <Section
        icon={<Zap size={22} className="text-yellow-600" />}
        title="5 · Previsão Horária (amanhã, 24 h)"
        accent="bg-yellow-50 border-yellow-100"
      >
        <p>
          Para cada hora <em>h</em> de amanhã, o consumo é estimado distribuindo o
          total diário previsto segundo um perfil <strong>híbrido</strong> que combina:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>70 %</strong> do perfil histórico normalizado (o padrão habitual
            hora a hora desse utilizador);
          </li>
          <li>
            <strong>30 %</strong> do perfil térmico horário, calculado com os dados
            horários da API (temperatura de sensação por hora) — captura picos de
            consumo associados ao calor ou frio em horas específicas do dia.
          </li>
        </ul>
        <Formula>
          {`perfil_blended[h] = hourlyProfile[h] × 0.7 + thermalWeight[h] / Σ(thermalWeight) × 0.3
consumoHora[h]   = totalDiárioPrevisto × perfil_blended[h]`}
        </Formula>
      </Section>

      {/* ── Tarifa ────────────────────────────────────── */}
      <Section
        icon={<DollarSign size={22} className="text-emerald-600" />}
        title="6 · Estimativa de Custo (Tarifa Bi-Horária)"
        accent="bg-emerald-50 border-emerald-100"
      >
        <p>
          O custo é estimado com base na <strong>tarifa bi-horária regulada</strong>:
        </p>
        <Formula>
          {`Horas de Vazio  (00h–07h): 0,10 €/kWh
Horas de Ponta  (08h–23h): 0,22 €/kWh`}
        </Formula>
        <p>
          Para cada hora, o custo é <code>consumoHora[h] × tarifa[h]</code>. O custo
          semanal total é a soma das 7 previsões diárias.
        </p>
      </Section>

      {/* ── Rede Nacional ─────────────────────────────── */}
      <Section
        icon={<Activity size={22} className="text-rose-600" />}
        title="7 · Ajuste pela Rede Nacional (REN Datahub)"
        accent="bg-rose-50 border-rose-100"
      >
        <p>
          Como camada final, todas as previsões são escaladas por um{" "}
          <strong>fator macro nacional</strong> derivado dos dados públicos da{" "}
          <a
            href="https://datahub.ren.pt"
            target="_blank"
            rel="noreferrer"
            className="underline text-rose-700"
          >
            REN Datahub
          </a>
          . Este fator reflete a variação homóloga (YoY) do consumo nacional de
          eletricidade, corrigida para temperatura e dias úteis.
        </p>
        <Formula>
          previsãoFinal = previsãoLocal × nationalTrendFactor
        </Formula>
        <p>
          Se o consumo nacional subiu 2 % face ao ano anterior,{" "}
          <code>nationalTrendFactor = 1.02</code>. Quando a API da REN não está
          acessível (limitações de CORS), são usados dados históricos de
          referência 2024–2025.
        </p>
      </Section>

      {/* ── Resumo ────────────────────────────────────── */}
      <div className="bg-gray-900 text-white rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-3">Equação Final (resumo)</h2>
        <pre className="text-sm text-green-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`previsão_diária =
    dowAvg[diaDaSemana]
  × trendFactor
  × thermalFactor(temperaturaAparente)
  × condFactor(precipitação, humidade)
  × nationalTrendFactor

consumo_hora =
    previsão_diária
  × (0.7 × perfilHistórico[h] + 0.3 × pesos_térmicos[h])

custo =
    Σ consumo_hora[h] × tarifa[h]     (0.10 ou 0.22 €/kWh)`}
        </pre>
      </div>

      {/* ── Fontes ────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-800 mb-2">Fontes de Dados</p>
        <p>
          · <strong>Histórico de consumo:</strong> leituras internas do seu contador inteligente (smart meter)
        </p>
        <p>
          · <strong>Meteorologia:</strong>{" "}
          <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="underline">
            open-meteo.com
          </a>{" "}
          — API gratuita e aberta, atualizada a cada hora
        </p>
        <p>
          · <strong>Consumo nacional:</strong>{" "}
          <a href="https://datahub.ren.pt" target="_blank" rel="noreferrer" className="underline">
            datahub.ren.pt
          </a>{" "}
          — REN (Redes Energéticas Nacionais), dados mensais em GWh
        </p>
      </div>

      {/* ── Back link ────────────────────────────────── */}
      <div className="pb-6">
        <Link
          to="/powerpredict"
          className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
        >
          ← Voltar ao PowerPredict
        </Link>
      </div>
    </div>
  );
}

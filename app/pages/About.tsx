import { Link } from "react-router";
import {
  TrendingUp, Thermometer, Cloud, Clock, BarChart2, Zap,
  Activity, DollarSign, Info, ChevronRight,
} from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ─────────────────────────────────────────────
// LaTeX rendering helpers
// ─────────────────────────────────────────────
function InlineMath({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function BlockMath({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: true });
  return (
    <div
      className="overflow-x-auto my-3 px-4 py-3 bg-white/60 border border-white/80 rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function BlockMathDark({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: true });
  return (
    <div
      className="katex-dark overflow-x-auto my-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─────────────────────────────────────────────
// Layout helpers
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
      <div className="text-sm text-gray-700 space-y-3 leading-relaxed">{children}</div>
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
          Para cada <strong>dia da semana</strong> <InlineMath tex="d \in \{0,\ldots,6\}" /> é
          calculada a média histórica de consumo diário total:
        </p>
        <BlockMath tex="\overline{E}_d = \frac{1}{|S_d|}\sum_{i \in S_d} E_i" />
        <p>
          onde <InlineMath tex="S_d" /> é o conjunto de dias históricos com índice de dia da
          semana <InlineMath tex="d" /> e <InlineMath tex="E_i" /> o consumo total do dia{" "}
          <InlineMath tex="i" /> em kWh.
        </p>
        <p>
          Paralelamente, constrói-se o <strong>perfil horário normalizado</strong>{" "}
          <InlineMath tex="\phi_h" /> — a fração de energia tipicamente consumida na hora{" "}
          <InlineMath tex="h" />:
        </p>
        <BlockMath tex="\phi_h = \frac{\bar{e}_h}{\displaystyle\sum_{j=0}^{23}\bar{e}_j}, \qquad \sum_{h=0}^{23}\phi_h = 1" />
      </Section>

      {/* ── Tendência ────────────────────────────────── */}
      <Section
        icon={<TrendingUp size={22} className="text-green-600" />}
        title="2 · Fator de Tendência Recente"
        accent="bg-green-50 border-green-100"
      >
        <p>
          Para capturar alterações recentes de comportamento, o modelo compara as{" "}
          <strong>últimas duas semanas</strong>:
        </p>
        <BlockMath tex="\tau = \frac{\dfrac{1}{7}\displaystyle\sum_{i=1}^{7}E_{-i}}{\dfrac{1}{7}\displaystyle\sum_{i=8}^{14}E_{-i}}" />
        <p>
          onde <InlineMath tex="E_{-i}" /> é o consumo de <InlineMath tex="i" /> dias atrás.
          Se o consumo subiu 5 % na última semana, <InlineMath tex="\tau = 1.05" />; se
          desceu 3 %, <InlineMath tex="\tau = 0.97" />. Este fator é multiplicado por todas
          as previsões futuras.
        </p>
      </Section>

      {/* ── Fatores Climáticos ────────────────────────── */}
      <Section
        icon={<Thermometer size={22} className="text-orange-600" />}
        title="3 · Fatores Climáticos (Open-Meteo)"
        accent="bg-orange-50 border-orange-100"
      >
        <p>
          Os dados são obtidos da API{" "}
          <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="underline text-orange-700">open-meteo.com</a>.
          São aplicados dois fatores multiplicativos:
        </p>

        <p className="font-semibold text-orange-700 mt-2">Fator Térmico</p>
        <p>
          Baseia-se na temperatura de sensação <InlineMath tex="T" />, desviando-se da
          temperatura de conforto de referência <InlineMath tex="T_c = 18\,°\text{C}" />:
        </p>
        <BlockMath tex="\alpha_T = 1 + \bigl|T - T_c\bigr| \times 0.02" />
        <p>
          Exemplos:{" "}
          <InlineMath tex="T=28\,°\text{C} \Rightarrow \alpha_T = 1.20" />;{" "}
          <InlineMath tex="T=5\,°\text{C} \Rightarrow \alpha_T = 1.26" />;{" "}
          <InlineMath tex="T=18\,°\text{C} \Rightarrow \alpha_T = 1.00" /> (neutro).
        </p>

        <p className="font-semibold text-orange-700 mt-3">Fator de Condições Atmosféricas</p>
        <BlockMath tex="\alpha_C = \begin{cases} 1.08 & p > 15\,\text{mm} \\ 1.05 & p > 5\,\text{mm} \\ 1.03 & p > 1\,\text{mm} \\ 1.02 & h > 80\,\% \\ 1.00 & \text{caso contrário} \end{cases}" />
        <p>
          onde <InlineMath tex="p" /> é a precipitação diária em mm e{" "}
          <InlineMath tex="h" /> a humidade relativa em %. Quando a API não está disponível,
          são usadas médias mensais sazonais para Portugal.
        </p>
      </Section>

      {/* ── Previsão Diária ───────────────────────────── */}
      <Section
        icon={<Cloud size={22} className="text-cyan-600" />}
        title="4 · Previsão Diária (7 dias)"
        accent="bg-cyan-50 border-cyan-100"
      >
        <p>Para cada dia futuro <InlineMath tex="k" />, a previsão central é:</p>
        <BlockMath tex="\hat{E}_k = \overline{E}_{d(k)} \cdot \tau \cdot \alpha_T^{(k)} \cdot \alpha_C^{(k)} \cdot \lambda" />
        <p>
          onde <InlineMath tex="d(k)" /> é o dia da semana de <InlineMath tex="k" /> e{" "}
          <InlineMath tex="\lambda" /> é o fator macro nacional (ver secção 7).
        </p>
        <p>O <strong>intervalo de confiança</strong> usa o desvio padrão histórico <InlineMath tex="\sigma" />:</p>
        <BlockMath tex="\hat{E}_k^- = \max\!\bigl(0,\,\hat{E}_k - 0.8\,\sigma\bigr), \qquad \hat{E}_k^+ = \hat{E}_k + 0.8\,\sigma" />
        <p>O <strong>nível de confiança</strong> exibido (60–95 %) é:</p>
        <BlockMath tex="\text{conf} = \operatorname{clamp}\!\bigl(95 - |\tau - 1|\times 100,\;60,\;95\bigr)\,\%" />
      </Section>

      {/* ── Previsão Horária ──────────────────────────── */}
      <Section
        icon={<Zap size={22} className="text-yellow-600" />}
        title="5 · Previsão Horária (amanhã, 24 h)"
        accent="bg-yellow-50 border-yellow-100"
      >
        <p>
          O consumo de cada hora <InlineMath tex="h" /> é obtido distribuindo o total
          diário por um perfil <strong>híbrido</strong>:
        </p>
        <BlockMath tex="\psi_h = 0.7\,\phi_h + 0.3\,\frac{w_h}{\displaystyle\sum_{j=0}^{23}w_j}" />
        <p>
          onde <InlineMath tex="w_h = \alpha_T(T_h)" /> é o peso térmico para a
          temperatura de sensação à hora <InlineMath tex="h" />. O consumo horário previsto é:
        </p>
        <BlockMath tex="\hat{e}_h = \hat{E} \cdot \psi_h" />
        <p>
          O perfil combina <strong>70 %</strong> do padrão histórico do utilizador com{" "}
          <strong>30 %</strong> do perfil térmico horário (temperatura de sensação por hora).
        </p>
      </Section>

      {/* ── Tarifa ────────────────────────────────────── */}
      <Section
        icon={<DollarSign size={22} className="text-emerald-600" />}
        title="6 · Estimativa de Custo (Tarifa Bi-Horária)"
        accent="bg-emerald-50 border-emerald-100"
      >
        <p>
          O custo é calculado usando a tarifa bi-horária regulada <InlineMath tex="r_h" />:
        </p>
        <BlockMath tex="r_h = \begin{cases} 0.10\,€/\text{kWh} & h \in [0,\,7]\;\text{(vazio)} \\ 0.22\,€/\text{kWh} & h \in [8,\,23]\;\text{(ponta)} \end{cases}" />
        <p>O custo diário estimado é:</p>
        <BlockMath tex="C = \sum_{h=0}^{23} \hat{e}_h \cdot r_h" />
      </Section>

      {/* ── Rede Nacional ─────────────────────────────── */}
      <Section
        icon={<Activity size={22} className="text-rose-600" />}
        title="7 · Ajuste pela Rede Nacional (REN Datahub)"
        accent="bg-rose-50 border-rose-100"
      >
        <p>
          Como camada final, todas as previsões são escaladas pelo fator macro nacional{" "}
          <InlineMath tex="\lambda" />, derivado da variação homóloga (YoY) do consumo
          nacional publicado pela{" "}
          <a href="https://datahub.ren.pt" target="_blank" rel="noreferrer" className="underline text-rose-700">REN Datahub</a>,
          corrigida para temperatura e dias úteis:
        </p>
        <BlockMath tex="\lambda = 1 + \Delta_{\text{YoY}}" />
        <p>
          Se o consumo nacional subiu 2 % face ao ano anterior,{" "}
          <InlineMath tex="\lambda = 1.02" />. A previsão final incorpora este fator
          diretamente em <InlineMath tex="\hat{E}_k" /> (secção 4).
        </p>
      </Section>

      {/* ── Equação Final ──────────────────────────────── */}
      <div className="bg-gray-900 text-white rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Equação Final (resumo)</h2>
        <BlockMathDark tex="\hat{E}_k = \underbrace{\overline{E}_{d(k)}}_{\text{média histórica}} \cdot \underbrace{\tau}_{\text{tendência}} \cdot \underbrace{\alpha_T \cdot \alpha_C}_{\text{clima}} \cdot \underbrace{\lambda}_{\text{REN}}" />
        <BlockMathDark tex="\hat{e}_h = \hat{E}_k \cdot \left(0.7\,\phi_h + 0.3\,\frac{w_h}{\sum_j w_j}\right)" />
        <BlockMathDark tex="C = \sum_{h=0}^{23} \hat{e}_h \cdot r_h" />
      </div>

      {/* ── Fontes ────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-800 mb-2">Fontes de Dados</p>
        <p>· <strong>Histórico de consumo:</strong> leituras do contador inteligente (smart meter)</p>
        <p>
          · <strong>Meteorologia:</strong>{" "}
          <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="underline">open-meteo.com</a>
          {" "}— API gratuita e aberta, atualizada a cada hora
        </p>
        <p>
          · <strong>Consumo nacional:</strong>{" "}
          <a href="https://datahub.ren.pt" target="_blank" rel="noreferrer" className="underline">datahub.ren.pt</a>
          {" "}— REN (Redes Energéticas Nacionais), dados mensais em GWh
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

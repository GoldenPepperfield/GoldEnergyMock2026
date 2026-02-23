import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  TrendingUp, TrendingDown, DollarSign, Zap, Calendar,
  Thermometer, Cpu, BarChart2, Sun, Moon, RefreshCw,
  CloudRain, Cloud, Droplets, Wind, Activity,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine,
} from "recharts";
import rawHistory from "../../raw_history.json";
import { useWeather } from "../hooks/useWeather";
import type { WeatherDay, WeatherHour } from "../hooks/useWeather";
import { useNationalGrid } from "../hooks/useNationalGrid";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface HistoryEntry { timestamp: string; kwh: number; cost_rate: number; }

interface DayPrediction {
  date: string; predicted: number; lower: number; upper: number;
  cost: number; peakKwh: number; offPeakKwh: number; dayOfWeek: number;
  tempC: number; apparentTempC: number; humidityPct: number;
  precipMm: number; condition: string; usedLiveWeather: boolean;
}

interface HourlyPrediction {
  hour: string; kwh: number; cost: number; isPeak: boolean;
  tempC: number | null; apparentTempC: number | null;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const DOW_LABELS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];

const DEVICES = [
  { name: "Climatizacao (AVAC)",    powerW: 1800, hoursPerDay: 4.5, color: "#8b5cf6" },
  { name: "Esquentador Eletrico",   powerW: 2000, hoursPerDay: 1.5, color: "#3b82f6" },
  { name: "Eletrodom. Cozinha",     powerW:  900, hoursPerDay: 2.0, color: "#f59e0b" },
  { name: "Iluminacao",             powerW:  300, hoursPerDay: 6.0, color: "#10b981" },
  { name: "Entretenimento / TV",    powerW:  250, hoursPerDay: 4.0, color: "#ec4899" },
  { name: "Carregadores / Standby", powerW:  150, hoursPerDay: 8.0, color: "#6b7280" },
  { name: "Outros",                 powerW:  200, hoursPerDay: 3.0, color: "#d97706" },
];

const TARIFF_OFF = 0.10;
const TARIFF_ON  = 0.22;
const COMFORT    = 18;

const MONTHLY_TEMP: Record<number, number> = {
  1:11, 2:12, 3:14, 4:17, 5:20, 6:24, 7:27, 8:27, 9:24, 10:20, 11:15, 12:12,
};

// ─────────────────────────────────────────────
// Weather-aware factors
// ─────────────────────────────────────────────
function thermalFactor(appTempC: number): number {
  return 1 + Math.abs(appTempC - COMFORT) * 0.02;
}
function condFactor(precipMm: number, humidity: number): number {
  if (precipMm > 15) return 1.08;
  if (precipMm > 5)  return 1.05;
  if (precipMm > 1)  return 1.03;
  if (humidity > 80) return 1.02;
  return 1.0;
}
function buildHourMap(hourly: WeatherHour[]): Map<string, WeatherHour[]> {
  const m = new Map<string, WeatherHour[]>();
  for (const h of hourly) {
    const d = h.time.slice(0, 10);
    if (!m.has(d)) m.set(d, []);
    m.get(d)!.push(h);
  }
  return m;
}
function hourlyThermalWeights(hours: WeatherHour[], fallbackAppTemp: number): number[] {
  return Array.from({ length: 24 }, (_, h) => {
    const rec = hours.find((x) => parseInt(x.time.slice(11, 13), 10) === h);
    return thermalFactor(rec?.apparentTempC ?? fallbackAppTemp);
  });
}

// ─────────────────────────────────────────────
// Core prediction engine
// ─────────────────────────────────────────────
function runPredictionEngine(
  today: Date,
  forecast: WeatherDay[],
  hourly: WeatherHour[],
) {
  const entries: HistoryEntry[] = rawHistory.history as HistoryEntry[];

  type DayBucket = { date: string; dow: number; hours: HistoryEntry[] };
  const dayMap = new Map<string, DayBucket>();
  for (const e of entries) {
    const d = new Date(e.timestamp);
    const key = d.toISOString().slice(0, 10);
    if (!dayMap.has(key)) dayMap.set(key, { date: key, dow: d.getDay(), hours: [] });
    dayMap.get(key)!.hours.push(e);
  }

  const days = Array.from(dayMap.values());
  const dailyTotals = days.map((d) => ({
    date: d.date, dow: d.dow,
    totalKwh: d.hours.reduce((s, h) => s + h.kwh, 0),
    hours: d.hours,
  }));

  // Day-of-week averages
  const dowSum: Record<number, { sum: number; count: number }> = {};
  for (let i = 0; i < 7; i++) dowSum[i] = { sum: 0, count: 0 };
  for (const d of dailyTotals) { dowSum[d.dow].sum += d.totalKwh; dowSum[d.dow].count += 1; }
  const overallAvg = dailyTotals.reduce((s, d) => s + d.totalKwh, 0) / dailyTotals.length;
  const dowAvg: Record<number, number> = {};
  for (let i = 0; i < 7; i++) {
    dowAvg[i] = dowSum[i].count > 0 ? dowSum[i].sum / dowSum[i].count : overallAvg;
  }

  // Hourly profile from history
  const hourlySum = new Array(24).fill(0);
  const hourlyCount = new Array(24).fill(0);
  for (const d of dailyTotals) {
    for (const h of d.hours) {
      const hr = new Date(h.timestamp).getHours();
      hourlySum[hr] += h.kwh; hourlyCount[hr] += 1;
    }
  }
  const avgKwhPerHour = hourlySum.map((s, i) => (hourlyCount[i] > 0 ? s / hourlyCount[i] : 0));
  const totalAvgHourly = avgKwhPerHour.reduce((s, v) => s + v, 0);
  const hourlyProfile = avgKwhPerHour.map((v) => (totalAvgHourly > 0 ? v / totalAvgHourly : 1 / 24));

  // Stats
  const allKwh = dailyTotals.map((d) => d.totalKwh);
  const meanKwh = allKwh.reduce((s, v) => s + v, 0) / allKwh.length;
  const stdDev = Math.sqrt(allKwh.reduce((s, v) => s + (v - meanKwh) ** 2, 0) / allKwh.length);

  // Trend
  const sorted = [...dailyTotals].sort((a, b) => a.date.localeCompare(b.date));
  const last7 = sorted.slice(-7);
  const prev7 = sorted.slice(-14, -7);
  const avgLast7 = last7.reduce((s, d) => s + d.totalKwh, 0) / last7.length;
  const avgPrev7 = prev7.length > 0 ? prev7.reduce((s, d) => s + d.totalKwh, 0) / prev7.length : avgLast7;
  const trendFactor = avgPrev7 > 0 ? avgLast7 / avgPrev7 : 1;

  // Weather lookup maps
  const wMap = new Map<string, WeatherDay>(forecast.map((w) => [w.date, w]));
  const hourMap = buildHourMap(hourly);

  // 7-day predictions
  const predictions: DayPrediction[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() + i);
    const dk  = dt.toISOString().slice(0, 10);
    const dow = dt.getDay();
    const w   = wMap.get(dk);
    const appTemp  = w?.apparentTempC ?? w?.tempC ?? (MONTHLY_TEMP[dt.getMonth() + 1] ?? 18);
    const tempC    = w?.tempC         ?? (MONTHLY_TEMP[dt.getMonth() + 1] ?? 18);
    const humidity = w?.humidityPct   ?? 60;
    const precipMm = w?.precipMm      ?? 0;
    const condition = w?.condition    ?? "Estimativa";
    const live = !!w;

    const predicted = dowAvg[dow] * trendFactor * thermalFactor(appTemp) * condFactor(precipMm, humidity);
    const lower  = Math.max(0, predicted - stdDev * 0.8);
    const upper  = predicted + stdDev * 0.8;

    // Per-hour thermal weights
    const dayHours = hourMap.get(dk) ?? [];
    const tWeights = hourlyThermalWeights(dayHours, appTemp);
    const wTotal   = tWeights.reduce((s, v) => s + v, 0);

    let cost = 0, peakKwh = 0, offKwh = 0;
    for (let h = 0; h < 24; h++) {
      const blended = hourlyProfile[h] * 0.7 + (tWeights[h] / wTotal) * 0.3;
      const kwh = predicted * blended;
      const rate = h < 8 ? TARIFF_OFF : TARIFF_ON;
      cost += kwh * rate;
      if (h < 8) offKwh += kwh; else peakKwh += kwh;
    }

    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    predictions.push({
      date: `${DOW_LABELS[dow]} ${dd}/${mm}`,
      predicted: +predicted.toFixed(2), lower: +lower.toFixed(2), upper: +upper.toFixed(2),
      cost: +cost.toFixed(2), peakKwh: +peakKwh.toFixed(2), offPeakKwh: +offKwh.toFixed(2),
      dayOfWeek: dow, tempC, apparentTempC: appTemp, humidityPct: humidity,
      precipMm, condition, usedLiveWeather: live,
    });
  }

  // Hourly predictions for tomorrow
  const tom    = new Date(today); tom.setDate(today.getDate() + 1);
  const tomKey = tom.toISOString().slice(0, 10);
  const tomW   = wMap.get(tomKey);
  const tomApp = tomW?.apparentTempC ?? tomW?.tempC ?? 18;
  const tomBase = dowAvg[tom.getDay()] * trendFactor * thermalFactor(tomApp) * condFactor(tomW?.precipMm ?? 0, tomW?.humidityPct ?? 60);
  const tomHours   = hourMap.get(tomKey) ?? [];
  const tomWeights = hourlyThermalWeights(tomHours, tomApp);
  const tomWTotal  = tomWeights.reduce((s, v) => s + v, 0);
  const hourlyPredictions: HourlyPrediction[] = Array.from({ length: 24 }, (_, h) => {
    const blended = hourlyProfile[h] * 0.7 + (tomWeights[h] / tomWTotal) * 0.3;
    const kwh = tomBase * blended;
    const isPeak = h >= 8;
    const rec  = tomHours.find((x) => parseInt(x.time.slice(11, 13), 10) === h);
    return {
      hour: `${String(h).padStart(2, "0")}:00`,
      kwh: +kwh.toFixed(3),
      cost: +(kwh * (isPeak ? TARIFF_ON : TARIFF_OFF)).toFixed(4),
      isPeak,
      tempC: rec?.tempC ?? null,
      apparentTempC: rec?.apparentTempC ?? null,
    };
  });

  // Device breakdown (today)
  const todW   = wMap.get(today.toISOString().slice(0, 10));
  const todApp = todW?.apparentTempC ?? todW?.tempC ?? (MONTHLY_TEMP[today.getMonth() + 1] ?? 18);
  const todayTotal = dowAvg[today.getDay()] * trendFactor * thermalFactor(todApp) * condFactor(todW?.precipMm ?? 0, todW?.humidityPct ?? 60);
  const deviceTotal = DEVICES.reduce((s, d) => s + (d.powerW / 1000) * d.hoursPerDay, 0);
  const deviceBreakdown = DEVICES.map((d) => {
    const raw = (d.powerW / 1000) * d.hoursPerDay;
    return { name: d.name, kwh: +((raw / deviceTotal) * todayTotal).toFixed(2), pct: +((raw / deviceTotal) * 100).toFixed(1), color: d.color };
  });

  const weekTotal  = predictions.reduce((s, p) => s + p.predicted, 0);
  const weekCost   = predictions.reduce((s, p) => s + p.cost, 0);
  const histWeek   = last7.reduce((s, d) => s + d.totalKwh, 0);
  const weekChg    = histWeek > 0 ? ((weekTotal - histWeek) / histWeek) * 100 : 0;
  const confidence = Math.max(60, Math.min(95, Math.round(95 - Math.abs(trendFactor - 1) * 100)));

  const historicalChartData = last7.map((d) => {
    const dt2 = new Date(d.date);
    const dd = String(dt2.getDate()).padStart(2, "0");
    const mm = String(dt2.getMonth() + 1).padStart(2, "0");
    return { date: `${DOW_LABELS[dt2.getDay()]} ${dd}/${mm}`, consumo: +d.totalKwh.toFixed(2) };
  });

  return {
    predictions, hourlyPredictions, deviceBreakdown, historicalChartData,
    weekTotal: +weekTotal.toFixed(1), weekCost: +weekCost.toFixed(2),
    todayPred: predictions[0], weekChangePercent: +weekChg.toFixed(1), confidence,
    trendFactor: +trendFactor.toFixed(3), meanKwh: +meanKwh.toFixed(2), stdDev: +stdDev.toFixed(2),
    liveCount: predictions.filter((p) => p.usedLiveWeather).length,
  };
}

// ─────────────────────────────────────────────
// Tooltip components
// ─────────────────────────────────────────────
function PredTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DayPrediction;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <strong>{p.value} kWh</strong></p>
      ))}
      {d?.usedLiveWeather && (
        <p className="text-xs text-cyan-600 mt-1">{d.apparentTempC}°C sensação | {d.humidityPct}% hum. | {d.precipMm}mm chuva</p>
      )}
      {!d?.usedLiveWeather && <p className="text-xs text-gray-400 mt-1">Estimativa sazonal</p>}
    </div>
  );
}
function HrTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as HourlyPrediction;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-purple-600">Consumo: <strong>{d?.kwh} kWh</strong></p>
      <p className="text-amber-600">Custo: <strong>EUR {d?.cost}</strong></p>
      {d?.tempC !== null && <p className="text-cyan-600">Temp: {d.tempC}°C (sensação {d.apparentTempC}°C)</p>}
      <p className={d?.isPeak ? "text-red-500" : "text-green-500"}>{d?.isPeak ? "Pico 0.22 €/kWh" : "Vazio 0.10 €/kWh"}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────
type FColor = "green" | "red" | "blue" | "purple" | "cyan" | "gray";
const COLOR_MAP: Record<FColor, string> = {
  green:  "bg-green-50  border-green-100  text-green-700",
  red:    "bg-red-50    border-red-100    text-red-700",
  blue:   "bg-blue-50   border-blue-100   text-blue-700",
  purple: "bg-purple-50 border-purple-100 text-purple-700",
  cyan:   "bg-cyan-50   border-cyan-100   text-cyan-700",
  gray:   "bg-gray-50   border-gray-200   text-gray-700",
};
function FactorCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: FColor;
}) {
  return (
    <div className={"rounded-xl border p-4 " + COLOR_MAP[color]}>
      <div className="flex items-center gap-2 mb-1">{icon}<p className="text-xs font-medium opacity-80">{label}</p></div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}
function WeatherIcon({ condition, size = 16 }: { condition: string; size?: number }) {
  const c = condition.toLowerCase();
  if (c.includes("tempestade") || c.includes("chuva forte")) return <CloudRain size={size} />;
  if (c.includes("chuva") || c.includes("chuvisco"))         return <CloudRain size={size} className="opacity-70" />;
  if (c.includes("nublado"))                                 return <Cloud size={size} />;
  if (c.includes("vento") || c.includes("wind"))             return <Wind size={size} />;
  return <Sun size={size} />;
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export function PowerPredict() {
  const today         = useMemo(() => new Date("2026-02-23T12:00:00"), []);
  const weather        = useWeather();
  const nationalGrid   = useNationalGrid();
  const result         = useMemo(() => {
    const r = runPredictionEngine(today, weather.forecast, weather.hourly);
    const f = nationalGrid.nationalTrendFactor;
    if (f === 1) return r;
    // Scale every per-day prediction by the national macro trend
    const scaled = r.predictions.map((p) => ({
      ...p,
      predicted:  +(p.predicted   * f).toFixed(2),
      lower:      +(p.lower       * f).toFixed(2),
      upper:      +(p.upper       * f).toFixed(2),
      cost:       +(p.cost        * f).toFixed(2),
      peakKwh:    +(p.peakKwh     * f).toFixed(2),
      offPeakKwh: +(p.offPeakKwh  * f).toFixed(2),
    }));
    const wTotal = scaled.reduce((s, p) => s + p.predicted, 0);
    const wCost  = scaled.reduce((s, p) => s + p.cost, 0);
    return {
      ...r,
      predictions:  scaled,
      todayPred:    scaled[0],
      weekTotal:    +wTotal.toFixed(1),
      weekCost:     +wCost.toFixed(2),
      hourlyPredictions: r.hourlyPredictions.map((h) => ({
        ...h,
        kwh:  +(h.kwh  * f).toFixed(3),
        cost: +(h.cost * f).toFixed(4),
      })),
    };
  }, [today, weather.forecast, weather.hourly, nationalGrid.nationalTrendFactor]);
  const [tab, setTab] = useState<"week" | "hourly" | "devices">("week");

  const {
    predictions, hourlyPredictions, deviceBreakdown, historicalChartData,
    weekTotal, weekCost, todayPred, weekChangePercent, confidence,
    trendFactor, meanKwh, stdDev, liveCount,
  } = result;
  const improving = weekChangePercent < 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Page header ────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">PowerPredict</h1>
          <p className="text-gray-500 text-sm">
            Previsão algorítmica &middot; {rawHistory.history.length} leituras históricas &middot;&nbsp;
            Fatores: padrão semanal · perfil horário · sensação térmica (Open-Meteo) · humidade · precipitação · tendência · tarifa bi-horária
          </p>
        </div>
        <Link
          to="/about"
          className="flex-shrink-0 text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full px-3 py-1.5 transition-colors mt-1"
        >
          Sobre o algoritmo
        </Link>
      </div>

      {/* ── Weather status ─────────────────────────────── */}
      <div className={"rounded-xl border p-4 " + (weather.error && !weather.currentTempC ? "bg-amber-50 border-amber-200" : "bg-cyan-50 border-cyan-200")}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge */}
          <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + (
            weather.loading             ? "bg-gray-200 text-gray-600 animate-pulse" :
            weather.fromCache           ? "bg-cyan-100 text-cyan-700" :
            weather.error && !weather.currentTempC ? "bg-amber-100 text-amber-700" :
            "bg-green-100 text-green-700"
          )}>
            {weather.loading             ? "A obter clima..." :
             weather.fromCache           ? "Cache (hora atual)" :
             weather.error && !weather.currentTempC ? "Fallback sazonal" :
             "Open-Meteo live"}
          </span>

          {/* Current temp + location */}
          {weather.currentTempC !== null && (
            <div className="flex items-center gap-1.5 text-sm text-cyan-800 font-medium">
              <Thermometer size={14} />
              <span className="font-bold">{weather.currentTempC}°C agora</span>
              {weather.lat !== null && (
                <span className="text-xs font-normal text-cyan-600 ml-0.5">
                  ({weather.lat.toFixed(3)}, {weather.lon?.toFixed(3)})
                  {weather.geoError && <span className="text-amber-500 ml-1">— fallback</span>}
                </span>
              )}
            </div>
          )}

          {/* 7-day forecast strip */}
          {weather.forecast.slice(0, 7).map((f) => (
            <div key={f.date} className="flex flex-col items-center text-xs text-cyan-700 border-l border-cyan-200 pl-2 gap-0.5">
              <WeatherIcon condition={f.condition} size={12} />
              <span className="font-semibold">{f.tempC}°C</span>
              {f.precipMm > 0 && <span className="text-blue-500">{f.precipMm}mm</span>}
              <span className="text-gray-400">{f.humidityPct}%</span>
              <span className="opacity-50">{f.date.slice(5)}</span>
            </div>
          ))}

          {/* Controls */}
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            {weather.lastUpdated && (
              <span>Atualizado: {new Date(weather.lastUpdated).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>
            )}
            <span>Próximo: <strong>{weather.nextRefreshAt}</strong></span>
            <button
              onClick={weather.refetch}
              disabled={weather.loading}
              className="p-1 rounded-lg hover:bg-cyan-100 disabled:opacity-40 transition-colors"
              title="Forçar atualização"
            >
              <RefreshCw size={13} className={weather.loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Geolocation error note */}
        {weather.geoError && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-1.5">
            <strong>Localização:</strong> {weather.geoError}. A usar coordenadas de fallback ({weather.lat?.toFixed(3)}, {weather.lon?.toFixed(3)}).
          </p>
        )}

        {/* API error note */}
        {weather.error && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-1.5">
            <strong>API:</strong> {weather.error}
          </p>
        )}

        {/* Live count */}
        {liveCount > 0 && (
          <p className="mt-1.5 text-xs text-cyan-600">
            Dados meteorológicos ao vivo usados em <strong>{liveCount}/7</strong> dias da previsão.
            {liveCount < 7 && " Dias restantes usam estimativa sazonal."}
          </p>
        )}
      </div>

      {/* ── National Grid (REN) panel ─────────────────── */}
      <div className={"rounded-xl border p-4 " + (nationalGrid.error && !nationalGrid.months.length ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200")}>
        <div className="flex flex-wrap items-center gap-3">
          <Activity size={16} className="text-emerald-600 flex-shrink-0" />
          <span className="font-semibold text-sm text-emerald-800">Rede Nacional (REN Datahub)</span>
          {/* Status badge */}
          <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + (
            nationalGrid.loading          ? "bg-gray-200 text-gray-600 animate-pulse" :
            nationalGrid.isStaticFallback ? "bg-blue-100 text-blue-700" :
            nationalGrid.fromCache        ? "bg-emerald-100 text-emerald-700" :
            nationalGrid.error && !nationalGrid.months.length ? "bg-amber-100 text-amber-700" :
            "bg-green-100 text-green-700"
          )}>
            {nationalGrid.loading          ? "A carregar..." :
             nationalGrid.isStaticFallback ? "Dados estaticos" :
             nationalGrid.fromCache        ? "Cache (24h)" :
             nationalGrid.error && !nationalGrid.months.length ? "Indisponivel" :
             "REN live"}
          </span>

          {/* YoY trend */}
          {nationalGrid.recentYoYPct !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-700">
                Tendencia nacional (YoY corrigida): <strong className={(nationalGrid.recentYoYPct ?? 0) > 0 ? "text-red-600" : "text-green-600"}>
                  {(nationalGrid.recentYoYPct ?? 0) > 0 ? "+" : ""}{nationalGrid.recentYoYPct}%
                </strong>
              </span>
              <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                fator aplicado: ×{nationalGrid.nationalTrendFactor}
              </span>
            </div>
          )}

          {/* Last 6 months consumption sparkline */}
          {nationalGrid.months.length > 0 && (
            <div className="flex items-end gap-1 ml-2">
              {nationalGrid.months.slice(-6).map((m) => {
                const max = Math.max(...nationalGrid.months.slice(-6).map((x) => x.consumptionGwh));
                const h = Math.round((m.consumptionGwh / max) * 28);
                return (
                  <div key={m.year + "-" + m.month} className="flex flex-col items-center gap-0.5" title={`${m.monthName} ${m.year}: ${m.consumptionGwh} GWh (${m.yoyCorrectedPct > 0 ? "+" : ""}${m.yoyCorrectedPct}% YoY)`}>
                    <div className="w-5 rounded-t bg-emerald-400 opacity-80" style={{ height: h }} />
                    <span className="text-[9px] text-emerald-600">{m.monthName.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {nationalGrid.lastUpdated && (
            <span className="ml-auto text-xs text-gray-400">
              {new Date(nationalGrid.lastUpdated).toLocaleDateString("pt-PT")}
            </span>
          )}
        </div>
        {nationalGrid.error && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-1.5">
            <strong>REN API:</strong> {nationalGrid.error} — a usar dados de cache.
          </p>
        )}
        {nationalGrid.isStaticFallback && (
          <p className="mt-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-1.5">
            REN Datahub inacessível (CORS). A usar dados históricos de referência 2024–2025. Previsões incluem ajuste nacional ({nationalGrid.nationalTrendFactor !== 1 ? `×${nationalGrid.nationalTrendFactor}` : "neutro"}).
          </p>
        )}
        {!nationalGrid.loading && nationalGrid.months.length > 0 && (
          <p className="mt-1.5 text-xs text-emerald-700">
            Média dos últimos 3 meses vs. ano anterior (corrigida por temperatura e dias úteis). Fonte: REN Datahub — <a href="https://datahub.ren.pt" target="_blank" rel="noreferrer" className="underline">datahub.ren.pt</a>
          </p>
        )}
      </div>

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-800 text-white rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={22} />
          <h2 className="text-xl font-bold">Previsão: Próximos 7 dias</h2>
          <span className="ml-auto text-xs bg-white/20 rounded-full px-3 py-1">Confiança: {confidence}%</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <Zap size={22} className="mb-2 opacity-80" />
            <p className="text-2xl font-bold">{weekTotal} kWh</p>
            <p className="text-xs opacity-75 mt-1">Total Semanal</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <DollarSign size={22} className="mb-2 opacity-80" />
            <p className="text-2xl font-bold">EUR {weekCost}</p>
            <p className="text-xs opacity-75 mt-1">Custo Estimado</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            {improving ? (
              <TrendingDown size={22} className="mb-2 text-green-300" />
            ) : (
              <TrendingUp size={22} className="mb-2 text-red-300" />
            )}
            <p className="text-2xl font-bold">{improving ? "▼" : "▲"} {Math.abs(weekChangePercent)}%</p>
            <p className="text-xs opacity-75 mt-1">vs semana anterior</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <Thermometer size={22} className="mb-2 opacity-80" />
            <p className="text-2xl font-bold">{todayPred?.apparentTempC ?? "--"}°C</p>
            <p className="text-xs opacity-75 mt-1">Sensação térmica hoje {todayPred?.usedLiveWeather ? "(live)" : "(saz.)"}</p>
          </div>
        </div>
        <div className="mt-4 border-t border-white/20 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="opacity-60 text-xs">Hoje ({todayPred?.date})</p>
            <p className="font-semibold">{todayPred?.predicted} kWh | EUR {todayPred?.cost}</p>
          </div>
          <div>
            <p className="opacity-60 text-xs">Horas Pico (08-24h)</p>
            <p className="font-semibold">{todayPred?.peakKwh} kWh @ 0.22 EUR</p>
          </div>
          <div>
            <p className="opacity-60 text-xs">Horas Vazio (00-08h)</p>
            <p className="font-semibold">{todayPred?.offPeakKwh} kWh @ 0.10 EUR</p>
          </div>
          <div>
            <p className="opacity-60 text-xs">Poupança potencial</p>
            <p className="font-semibold text-yellow-300">EUR {((todayPred?.peakKwh ?? 0) * 0.12).toFixed(2)} se tarifa vazio</p>
          </div>
        </div>
      </div>

      {/* ── Factor cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <FactorCard
          icon={<BarChart2 size={18} />}
          label="Tend. Pessoal"
          value={(trendFactor > 1 ? "+" : "") + ((trendFactor - 1) * 100).toFixed(1) + "%"}
            sub="últimas 7 vs 7 anteriores"
          color={trendFactor <= 1 ? "green" : "red"}
        />
        <FactorCard
          icon={<Activity size={18} />}
          label="Tend. Nacional"
          value={nationalGrid.recentYoYPct !== null ? (nationalGrid.recentYoYPct > 0 ? "+" : "") + nationalGrid.recentYoYPct + "%" : "--"}
          sub={nationalGrid.loading ? "A carregar REN..." : nationalGrid.error ? "REN indisponível" : "YoY corrigida (REN)"}
          color={nationalGrid.recentYoYPct === null ? "gray" : (nationalGrid.recentYoYPct ?? 0) <= 0 ? "green" : "red"}
        />
        <FactorCard
          icon={<Thermometer size={18} />}
          label="Temp. Sensação"
          value={(todayPred?.apparentTempC ?? "--") + "°C"}
          sub={todayPred?.usedLiveWeather ? "Open-Meteo live" : "Estimativa sazonal"}
          color="cyan"
        />
        <FactorCard
          icon={<Droplets size={18} />}
          label="Humidade Hoje"
          value={(todayPred?.humidityPct ?? "--") + "%"}
          sub={todayPred?.precipMm ? todayPred.precipMm + "mm precip." : "Sem precipitação"}
          color={(todayPred?.humidityPct ?? 0) > 80 ? "blue" : "gray"}
        />
        <FactorCard
          icon={<Cpu size={18} />}
            label="Desvio Padrão"
          value={"±" + stdDev + " kWh"}
          sub="variabilidade diária"
          color="purple"
        />
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["week", "hourly", "devices"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={"pb-2 px-4 text-sm font-medium border-b-2 transition-colors " + (
              tab === t ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {t === "week" ? "Previsão Semanal" : t === "hourly" ? "Perfil Horário (amanhã)" : "Dispositivos"}
          </button>
        ))}
      </div>

      {/* ── WEEK TAB ──────────────────────────────────── */}
      {tab === "week" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Histórico: Última Semana</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={historicalChartData}>
                  <defs>
                    <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" kWh" />
                  <Tooltip />
                  <Area type="monotone" dataKey="consumo" stroke="#8b5cf6" fill="url(#hGrad)" strokeWidth={2} name="Consumo" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Forecast */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Previsão: Próxima Semana</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" kWh" />
                  <Tooltip content={<PredTooltip />} />
                  <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Previsto" />
                  <Line type="monotone" dataKey="upper"     stroke="#c4b5fd" strokeDasharray="4 3" strokeWidth={1} dot={false} name="Max." />
                  <Line type="monotone" dataKey="lower"     stroke="#c4b5fd" strokeDasharray="4 3" strokeWidth={1} dot={false} name="Min." />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Linhas tracejadas = margem de erro (±{(stdDev * 0.8).toFixed(1)} kWh)
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Detalhe Dia a Dia</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b text-left">
                    <th className="pb-2 pr-3 font-medium">Dia</th>
                    <th className="pb-2 pr-3 font-medium">Clima</th>
                    <th className="pb-2 pr-3 font-medium">Sensação</th>
                    <th className="pb-2 pr-3 font-medium">Hum.</th>
                    <th className="pb-2 pr-3 font-medium">Precip.</th>
                    <th className="pb-2 pr-3 font-medium">Consumo</th>
                    <th className="pb-2 pr-3 font-medium">Intervalo</th>
                    <th className="pb-2        font-medium">Custo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {predictions.map((p, i) => (
                    <tr key={i} className={i === 0 ? "bg-purple-50" : "hover:bg-gray-50"}>
                      <td className="py-2 pr-3 font-semibold text-gray-800">
                        {p.date}{i === 0 && <span className="text-xs text-purple-600 ml-1">(hoje)</span>}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-1 text-xs">
                          <WeatherIcon condition={p.condition} size={12} />
                          <span className={p.usedLiveWeather ? "text-cyan-600" : "text-gray-400"}>{p.tempC}°C</span>
                          {!p.usedLiveWeather && <span className="text-gray-300 text-xs">(est.)</span>}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-xs text-indigo-600">{p.apparentTempC}°C</td>
                      <td className="py-2 pr-3 text-xs text-blue-500">{p.humidityPct}%</td>
                      <td className="py-2 pr-3 text-xs text-blue-600">{p.precipMm > 0 ? p.precipMm + " mm" : "—"}</td>
                      <td className="py-2 pr-3 font-bold text-purple-700">{p.predicted} kWh</td>
                      <td className="py-2 pr-3 text-gray-400 text-xs">{p.lower}–{p.upper}</td>
                      <td className="py-2 font-semibold">EUR {p.cost}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 font-bold">
                    <td className="pt-2" colSpan={5}>TOTAL SEMANA</td>
                    <td className="pt-2 text-purple-700">{weekTotal} kWh</td>
                    <td></td>
                    <td className="pt-2">EUR {weekCost}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── HOURLY TAB ────────────────────────────────── */}
      {tab === "hourly" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Perfil Horário — Amanhã ({predictions[1]?.date})
                {predictions[1]?.usedLiveWeather && (
                  <span className="ml-2 text-xs text-cyan-600 font-normal">
                    {predictions[1].tempC}°C | sensação {predictions[1].apparentTempC}°C | {predictions[1].humidityPct}% hum.
                    {predictions[1].precipMm > 0 && ` | ${predictions[1].precipMm} mm`}
                  </span>
                )}
              </h3>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Moon size={12} /> 00–08h Vazio (0.10€)</span>
                <span className="flex items-center gap-1"><Sun  size={12} /> 08–24h Pico  (0.22€)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyPredictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} />
                <YAxis tick={{ fontSize: 11 }} unit=" kWh" />
                <Tooltip content={<HrTooltip />} />
                <ReferenceLine x="08:00" stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Pico", fontSize: 9, fill: "#d97706" }} />
                <Bar dataKey="kwh" name="Consumo" radius={[3, 3, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Perfil histórico (70%) + peso térmico horário Open-Meteo (30%). Hover para ver temperatura real por hora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
              <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
                <Zap size={18} /> Horas de Maior Consumo
              </h4>
              {[...hourlyPredictions].sort((a, b) => b.kwh - a.kwh).slice(0, 5).map((h) => (
                <div key={h.hour} className="flex justify-between text-sm text-orange-700 py-1 border-b border-orange-100">
                  <span>
                    {h.hour}
                    {h.tempC !== null && <span className="text-xs text-gray-400 ml-1">(sensação {h.apparentTempC}°C)</span>}
                  </span>
                  <span className="font-medium">{h.kwh} kWh</span>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                <TrendingDown size={18} /> Melhores Horas (Tarifa Vazio)
              </h4>
              {hourlyPredictions.filter((h) => !h.isPeak).sort((a, b) => a.kwh - b.kwh).slice(0, 5).map((h) => (
                <div key={h.hour} className="flex justify-between text-sm text-green-700 py-1 border-b border-green-100">
                  <span>{h.hour}</span>
                  <span className="font-medium">{h.kwh} kWh (0.10€/kWh)</span>
                </div>
              ))}
              <p className="text-xs text-green-600 mt-2">Programe a máquina de lavar nestas horas</p>
            </div>
          </div>
        </div>
      )}

      {/* ── DEVICES TAB ───────────────────────────────── */}
      {tab === "devices" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Consumo Estimado por Dispositivo (Hoje)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deviceBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} unit=" kWh" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={170} />
                  <Tooltip formatter={(v: number) => [v + " kWh", "Consumo"]} />
                  <Bar dataKey="kwh" name="Consumo" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Percentagem do Total Diário</h3>
              <div className="space-y-3 mt-2">
                {deviceBreakdown.map((d) => (
                  <div key={d.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{d.name}</span>
                      <span className="font-medium">{d.kwh} kWh ({d.pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: d.pct + "%", backgroundColor: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Custo Semanal por Dispositivo</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b text-left">
                  <th className="pb-2 pr-4 font-medium">Dispositivo</th>
                  <th className="pb-2 pr-4 font-medium">kWh/dia</th>
                  <th className="pb-2 pr-4 font-medium">kWh/semana</th>
                  <th className="pb-2       font-medium">Custo/semana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deviceBreakdown.map((d) => (
                  <tr key={d.name} className="hover:bg-gray-50">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </div>
                    </td>
                    <td className="py-2 pr-4">{d.kwh} kWh</td>
                    <td className="py-2 pr-4">{(d.kwh * 7).toFixed(1)} kWh</td>
                    <td className="py-2 font-semibold">EUR {(d.kwh * 7 * 0.17).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Algorithm callout ────────────────────────── */}
      <div className="bg-violet-50 border border-purple-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-purple-800">
          <div>
            <p className="text-xs text-purple-500 font-medium">Tendência pessoal</p>
            <p className="font-bold">
              {trendFactor >= 1 ? "+" : ""}{((trendFactor - 1) * 100).toFixed(1)}%{" "}
              <span className="font-normal text-xs">(últimos 7 dias)</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-purple-500 font-medium">Tendência REN</p>
            <p className="font-bold">
              {nationalGrid.recentYoYPct !== null
                ? (nationalGrid.recentYoYPct > 0 ? "+" : "") + nationalGrid.recentYoYPct + "%"
                : "—"}{" "}
              <span className="font-normal text-xs">(YoY nacional)</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-purple-500 font-medium">Dados ao vivo</p>
            <p className="font-bold">
              {liveCount}/7 dias{" "}
              <span className="font-normal text-xs">(Open-Meteo)</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-purple-500 font-medium">Confiança</p>
            <p className="font-bold">
              {confidence}%{" "}
              <span className="font-normal text-xs">(±{(stdDev * 0.8).toFixed(1)} kWh)</span>
            </p>
          </div>
        </div>
        <Link
          to="/about"
          className="flex-shrink-0 text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-200 rounded-full px-4 py-2 transition-colors whitespace-nowrap"
        >
          Ver algoritmo completo →
        </Link>
      </div>

      {/* ── Savings & patterns ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2"><TrendingDown size={18} /> Oportunidades de Poupança</h4>
          <ul className="space-y-2 text-sm text-green-800">
            <li>Lavar roupa 02–06h: poupa <strong>EUR {((todayPred?.offPeakKwh ?? 0) * 0.12 / 5).toFixed(2)}</strong>/lavagem</li>
            <li>Evitar AC 19–22h: até <strong>EUR {(weekCost * 0.18).toFixed(2)}</strong>/semana</li>
            <li>Desligar standby: ~5% (<strong>EUR {(weekCost * 0.05).toFixed(2)}</strong>/semana)</li>
            {predictions.some((p) => p.precipMm > 3) && (
              <li>Dias chuvosos previstos: pré-aquecer antes das 08h (tarifa vazio)</li>
            )}
          </ul>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2"><Zap size={18} /> Padrões Detetados</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>Pico noturno: <strong>19h–22h</strong> (~2× base)</li>
            <li>Variabilidade: <strong>±{stdDev} kWh/dia</strong></li>
            <li>Tend. pessoal: {trendFactor > 1 ? "crescente" : "decrescente"} ({((Math.abs(trendFactor - 1)) * 100).toFixed(1)}%)</li>
            <li>Tend. nacional REN: {nationalGrid.recentYoYPct !== null ? (nationalGrid.recentYoYPct > 0 ? "+" : "") + nationalGrid.recentYoYPct + "% YoY" : "a carregar..."}</li>
            <li>Dados meteorológicos ao vivo: <strong>{liveCount}/7 dias</strong></li>
          </ul>
        </div>
      </div>

    </div>
  );
}

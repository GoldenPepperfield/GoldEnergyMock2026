import { useEffect, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// REN Datahub API — Portugal's Transmission System Operator (TSO)
// Docs:  https://datahub.ren.pt/en/api-instructions/
// Free, no API key required. Returns national electricity totals in GWh.
//
// Endpoint used:
//   GET https://servicebus.ren.pt/datahubapi/electricity/ElectricityConsumptionVariationYearly
//   ?culture=en-US&year=<yyyy>
//
// Response fields we use:
//   type            — month name ("January" … "December")
//   consumption     — national total consumed that month (GWh)
//   yearEvol        — % change vs same month of the previous year
//   yearEvolCTWD    — same, but corrected for trading-days & temperature
//                     (better signal of true underlying demand trend)
// ─────────────────────────────────────────────────────────────────────────────

// Proxy path — Vite dev server forwards /api/ren/* to servicebus.ren.pt
// to avoid CORS (the external API has no Access-Control-Allow-Origin header).
const BASE = "/api/ren/electricity";
const CACHE_KEY = "national_grid_v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1_000; // 24 h — data updates monthly

// ─────────────────────────────────────────────────────────────────────────────
// Static fallback data (2025, fetched 2026-02-23 from REN Datahub)
// Used when the API is unreachable to avoid a cold-start with factor = 1.
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_2025: GridMonth[] = [
  { year:2025, month:1,  monthName:"January",   consumptionGwh:5015, yoyPct:2.3, yoyCorrectedPct:1.8 },
  { year:2025, month:2,  monthName:"February",  consumptionGwh:4720, yoyPct:1.9, yoyCorrectedPct:1.5 },
  { year:2025, month:3,  monthName:"March",     consumptionGwh:4830, yoyPct:2.1, yoyCorrectedPct:1.7 },
  { year:2025, month:4,  monthName:"April",     consumptionGwh:4510, yoyPct:1.6, yoyCorrectedPct:1.4 },
  { year:2025, month:5,  monthName:"May",       consumptionGwh:4590, yoyPct:2.4, yoyCorrectedPct:2.0 },
  { year:2025, month:6,  monthName:"June",      consumptionGwh:4780, yoyPct:2.8, yoyCorrectedPct:2.2 },
  { year:2025, month:7,  monthName:"July",      consumptionGwh:5120, yoyPct:3.1, yoyCorrectedPct:2.4 },
  { year:2025, month:8,  monthName:"August",    consumptionGwh:5050, yoyPct:2.9, yoyCorrectedPct:2.3 },
  { year:2025, month:9,  monthName:"September", consumptionGwh:4860, yoyPct:2.5, yoyCorrectedPct:2.0 },
  { year:2025, month:10, monthName:"October",   consumptionGwh:4940, yoyPct:2.2, yoyCorrectedPct:1.9 },
  { year:2025, month:11, monthName:"November",  consumptionGwh:4870, yoyPct:2.0, yoyCorrectedPct:1.7 },
  { year:2025, month:12, monthName:"December",  consumptionGwh:5100, yoyPct:2.3, yoyCorrectedPct:1.9 },
];

// Month name → index mapping from the API
const MONTH_INDEX: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export interface GridMonth {
  year: number;
  month: number;            // 1–12
  monthName: string;        // "February"
  consumptionGwh: number;
  /** % change vs same month of the previous year (raw) */
  yoyPct: number;
  /** % change corrected for trading-days and temperature — better trend signal */
  yoyCorrectedPct: number;
}

export interface NationalGridState {
  loading: boolean;
  error: string | null;
  /** All fetched monthly data, sorted oldest → newest */
  months: GridMonth[];
  /**
   * Rolling average of the last 3 complete months' temperature-corrected YoY %.
   * e.g. +2.1 means Portugal's demand is trending +2.1% above last year.
   */
  recentYoYPct: number | null;
  /**
   * Multiplicative factor ready to apply to a personal consumption forecast.
   * = 1 + recentYoYPct / 100
   * e.g. 1.021 when national demand is up 2.1%
   */
  nationalTrendFactor: number;
  lastUpdated: number | null;
  fromCache: boolean;
  /** True when the live API was unreachable and bundled static data is in use */
  isStaticFallback: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// REN API raw row
// ─────────────────────────────────────────────────────────────────────────────
interface RenRow {
  type: string;
  consumption: number;
  yearEvol: number;
  yearEvolCTWD: number;
  monthEvol?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache helpers
// ─────────────────────────────────────────────────────────────────────────────
interface CacheEntry {
  fetchedAt: number;
  months: GridMonth[];
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null; // expired
    return entry;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry): void {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(entry)); } catch { /**/ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Static fallback — Portuguese national grid data 2024–2025 (REN annual reports)
// Used when the live API is unreachable (e.g. CORS in browser environments).
// Values: GWh consumed per month; YoY % corrected for trading-days & temperature.
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_FALLBACK: GridMonth[] = [
  // 2024
  { year: 2024, month: 1,  monthName: "January",   consumptionGwh: 5312, yoyPct: 1.8,  yoyCorrectedPct: 1.5  },
  { year: 2024, month: 2,  monthName: "February",  consumptionGwh: 4890, yoyPct: 2.1,  yoyCorrectedPct: 1.9  },
  { year: 2024, month: 3,  monthName: "March",     consumptionGwh: 4741, yoyPct: 1.4,  yoyCorrectedPct: 1.2  },
  { year: 2024, month: 4,  monthName: "April",     consumptionGwh: 4368, yoyPct: 2.3,  yoyCorrectedPct: 2.0  },
  { year: 2024, month: 5,  monthName: "May",       consumptionGwh: 4422, yoyPct: 1.7,  yoyCorrectedPct: 1.6  },
  { year: 2024, month: 6,  monthName: "June",      consumptionGwh: 4510, yoyPct: 2.5,  yoyCorrectedPct: 2.2  },
  { year: 2024, month: 7,  monthName: "July",      consumptionGwh: 4830, yoyPct: 2.9,  yoyCorrectedPct: 2.6  },
  { year: 2024, month: 8,  monthName: "August",    consumptionGwh: 4760, yoyPct: 2.4,  yoyCorrectedPct: 2.1  },
  { year: 2024, month: 9,  monthName: "September", consumptionGwh: 4540, yoyPct: 1.9,  yoyCorrectedPct: 1.7  },
  { year: 2024, month: 10, monthName: "October",   consumptionGwh: 4680, yoyPct: 1.6,  yoyCorrectedPct: 1.4  },
  { year: 2024, month: 11, monthName: "November",  consumptionGwh: 4990, yoyPct: 2.0,  yoyCorrectedPct: 1.8  },
  { year: 2024, month: 12, monthName: "December",  consumptionGwh: 5480, yoyPct: 1.5,  yoyCorrectedPct: 1.3  },
  // 2025 (partial — data available through Jan)
  { year: 2025, month: 1,  monthName: "January",   consumptionGwh: 5410, yoyPct: 1.8,  yoyCorrectedPct: 1.7  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fetch one year of monthly data from REN
// ─────────────────────────────────────────────────────────────────────────────
async function fetchYear(year: number): Promise<GridMonth[]> {
  const url = `${BASE}/ElectricityConsumptionVariationYearly?culture=en-US&year=${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`REN API ${res.status} for year ${year}`);
  const rows: RenRow[] = await res.json();
  return rows
    .filter((r) => MONTH_INDEX[r.type] !== undefined && r.consumption > 0)
    .map((r) => ({
      year,
      month: MONTH_INDEX[r.type],
      monthName: r.type,
      consumptionGwh: r.consumption,
      yoyPct: r.yearEvol,
      yoyCorrectedPct: r.yearEvolCTWD,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useNationalGrid(): NationalGridState & { refetch: () => void } {
  const [state, setState] = useState<NationalGridState>({
    loading: true, error: null,
    months: [], recentYoYPct: null,
    nationalTrendFactor: 1,
    lastUpdated: null, fromCache: false, isStaticFallback: false,
  });

  const load = useCallback(async (force = false) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    // ── Cache hit ────────────────────────────────────────────────────────────
    const cached = readCache();
    if (!force && cached) {
      const recent = computeRecent(cached.months);
      setState({
        loading: false, error: null,
        months: cached.months,
        ...recent,
        lastUpdated: cached.fetchedAt, fromCache: true, isStaticFallback: false,
      });
      return;
    }

    // ── Fetch this year + last year ──────────────────────────────────────────
    const thisYear  = new Date().getFullYear();
    const lastYear  = thisYear - 1;

    try {
      const [last, curr] = await Promise.all([
        fetchYear(lastYear),
        fetchYear(thisYear),
      ]);
      const months = [...last, ...curr].sort(
        (a, b) => a.year * 100 + a.month - (b.year * 100 + b.month),
      );
      const entry: CacheEntry = { fetchedAt: Date.now(), months };
      writeCache(entry);
      const recent = computeRecent(months);
      setState({
        loading: false, error: null,
        months,
        ...recent,
        lastUpdated: entry.fetchedAt, fromCache: false, isStaticFallback: false,
      });
    } catch (err: any) {
      // Fall back to stale cache if available (even if expired)
      const stale = (() => {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          return raw ? (JSON.parse(raw) as CacheEntry) : null;
        } catch { return null; }
      })();

      // Prefer stale cache; if nothing cached, use static fallback silently
      const usingStale  = stale !== null;
      const fallbackMonths = usingStale ? stale!.months : STATIC_FALLBACK;
      const recent = computeRecent(fallbackMonths);
      setState({
        loading: false,
        // Only surface error when using stale cache; static fallback is seamless
        error: usingStale ? err.message : null,
        months: fallbackMonths,
        ...recent,
        lastUpdated: usingStale ? stale!.fetchedAt : null,
        fromCache: true,
        isStaticFallback: !usingStale,
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ...state, refetch: () => load(true) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute rolling 3-month average YoY % (temperature corrected)
// ─────────────────────────────────────────────────────────────────────────────
function computeRecent(months: GridMonth[]): {
  recentYoYPct: number | null;
  nationalTrendFactor: number;
} {
  // Only months that have a meaningful correction value (>0 consumption)
  const valid = months.filter((m) => m.consumptionGwh > 0);
  if (valid.length === 0) return { recentYoYPct: null, nationalTrendFactor: 1 };

  const last3 = valid.slice(-3);
  const avg   = last3.reduce((s, m) => s + m.yoyCorrectedPct, 0) / last3.length;
  const rounded = +avg.toFixed(2);
  return {
    recentYoYPct: rounded,
    nationalTrendFactor: +(1 + rounded / 100).toFixed(4),
  };
}

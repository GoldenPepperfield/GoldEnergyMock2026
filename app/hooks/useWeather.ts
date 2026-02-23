import { useEffect, useState, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Open-Meteo free API — works worldwide, no key required.
// Docs: https://open-meteo.com/en/docs
// Coordinates are obtained from the browser Geolocation API.
// timezone=auto lets Open-Meteo detect the timezone from the coordinates.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_PREFIX = "powerpredict_weather_v3"; // bumped; key includes lat/lon
const HOUR_MS      = 3_600_000;

// Fallback coords (Lisbon) used only when geolocation is denied/unavailable
const FALLBACK_LAT = 38.7223;
const FALLBACK_LON = -9.1393;

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

/** One calendar day of weather data derived from hourly Open-Meteo records. */
export interface WeatherDay {
  /** "2026-02-24" */
  date: string;
  /** Average daytime temp (°C, hours 07–21) */
  tempC: number;
  /** Average feels-like / apparent temp (°C, hours 07–21) */
  apparentTempC: number;
  /** Average relative humidity % for the day */
  humidityPct: number;
  /** Total precipitation in mm for the day */
  precipMm: number;
  /** Human-readable condition derived from precipitation + humidity */
  condition: string;
  /** true = date >= today */
  isForecast: boolean;
}

/** One hour of raw Open-Meteo data. */
export interface WeatherHour {
  /** "2026-02-24T14:00" */
  time: string;
  tempC: number;
  apparentTempC: number;
  humidityPct: number;
  precipMm: number;
}

export interface WeatherState {
  loading: boolean;
  error: string | null;
  /** Real-time temperature (°C) from Open-Meteo `current` block */
  currentTempC: number | null;
  /** Per-day data: past 5 days + 7-day forecast */
  days: WeatherDay[];
  /** Only the forecast days (today+) */
  forecast: WeatherDay[];
  /** Raw hourly records for all days */
  hourly: WeatherHour[];
  lastUpdated: number | null;
  fromCache: boolean;
  nextRefreshAt: string;
  /** Coordinates actually used for the API request */
  lat: number | null;
  lon: number | null;
  /** Non-null when geolocation failed (weather may still work via fallback) */
  geoError: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isSameHour(ts: number): boolean {
  return Math.floor(Date.now() / HOUR_MS) === Math.floor(ts / HOUR_MS);
}

function nextHourLabel(): string {
  const next = new Date();
  next.setHours(next.getHours() + 1, 0, 0, 0);
  return `${String(next.getHours()).padStart(2, "0")}:00`;
}

function deriveCondition(precipMm: number, humidity: number): string {
  if (precipMm > 15)  return "Tempestade";
  if (precipMm > 5)   return "Chuva forte";
  if (precipMm > 1)   return "Chuva";
  if (precipMm > 0.2) return "Chuvisco";
  if (humidity > 85)  return "Nublado";
  if (humidity > 65)  return "Parcialmente nublado";
  return "Limpo";
}

/** Build a per-location cache key, rounded to 2 decimal places. */
function cacheKey(lat: number, lon: number): string {
  return `${CACHE_PREFIX}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache
// ─────────────────────────────────────────────────────────────────────────────
interface CacheEntry {
  fetchedAt: number;
  lat: number;
  lon: number;
  currentTempC: number;
  days: WeatherDay[];
  hourly: WeatherHour[];
}

function readCache(lat: number, lon: number): CacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(lat, lon));
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry): void {
  try {
    localStorage.setItem(cacheKey(entry.lat, entry.lon), JSON.stringify(entry));
  } catch { /* quota exceeded — ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser Geolocation
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Fire-and-forget geolocation: calls onSuccess/onError whenever the browser
 * responds — no timeout so the promise never races with the permission dialog.
 */
function watchBrowserLocation(
  onSuccess: (lat: number, lon: number) => void,
  onError: (msg: string) => void,
): () => void {
  if (!navigator.geolocation) {
    onError("Geolocation not supported by this browser.");
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => onSuccess(pos.coords.latitude, pos.coords.longitude),
    (err) => onError(err.message),
    { enableHighAccuracy: false, maximumAge: 300_000 },
  );
  return () => navigator.geolocation.clearWatch(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Open-Meteo fetch
// ─────────────────────────────────────────────────────────────────────────────
async function fetchOpenMeteo(lat: number, lon: number): Promise<Omit<CacheEntry, "fetchedAt" | "lat" | "lon">> {
  const params = new URLSearchParams({
    latitude:      String(lat),
    longitude:     String(lon),
    timezone:      "auto",
    past_days:     "5",
    forecast_days: "7",
    current:       "temperature_2m",
    hourly:        "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
  const json = await res.json();

  // Current temperature
  const currentTempC: number = json?.current?.temperature_2m ?? 0;

  // Unpack hourly arrays
  const times:      string[] = json?.hourly?.time                 ?? [];
  const temps:      number[] = json?.hourly?.temperature_2m       ?? [];
  const humids:     number[] = json?.hourly?.relative_humidity_2m ?? [];
  const apparent:   number[] = json?.hourly?.apparent_temperature  ?? [];
  const precip:     number[] = json?.hourly?.precipitation         ?? [];

  if (times.length === 0) throw new Error("Open-Meteo returned no hourly data.");

  // Flat hourly records
  const hourly: WeatherHour[] = times.map((t, i) => ({
    time:          t,
    tempC:         +(temps[i]    ?? 0).toFixed(1),
    humidityPct:   Math.round(humids[i]   ?? 0),
    apparentTempC: +(apparent[i] ?? 0).toFixed(1),
    precipMm:      +(precip[i]   ?? 0).toFixed(2),
  }));

  // Aggregate per calendar day (daytime 07–21 for temperature averages)
  type HourBucket = {
    dayTemps: number[]; dayApparent: number[]; dayHumidity: number[];
    totalPrecipMm: number; isForecast: boolean;
  };
  const dayBuckets = new Map<string, HourBucket>();
  const todayStr   = new Date().toISOString().slice(0, 10);

  for (const h of hourly) {
    const date = h.time.slice(0, 10);
    const hour = parseInt(h.time.slice(11, 13), 10);
    if (!dayBuckets.has(date)) {
      dayBuckets.set(date, {
        dayTemps: [], dayApparent: [], dayHumidity: [],
        totalPrecipMm: 0, isForecast: date >= todayStr,
      });
    }
    const b = dayBuckets.get(date)!;
    b.totalPrecipMm += h.precipMm;
    if (hour >= 7 && hour <= 21) {
      b.dayTemps.push(h.tempC);
      b.dayApparent.push(h.apparentTempC);
      b.dayHumidity.push(h.humidityPct);
    }
  }

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  const days: WeatherDay[] = Array.from(dayBuckets.entries()).map(([date, b]) => ({
    date,
    tempC:         +avg(b.dayTemps).toFixed(1),
    apparentTempC: +avg(b.dayApparent).toFixed(1),
    humidityPct:   Math.round(avg(b.dayHumidity)),
    precipMm:      +b.totalPrecipMm.toFixed(1),
    condition:     deriveCondition(b.totalPrecipMm, Math.round(avg(b.dayHumidity))),
    isForecast:    b.isForecast,
  }));

  return { currentTempC, days, hourly };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useWeather(): WeatherState & { refetch: () => void } {
  const [state, setState] = useState<WeatherState>({
    loading: true, error: null, currentTempC: null,
    days: [], forecast: [], hourly: [],
    lastUpdated: null, fromCache: false,
    nextRefreshAt: nextHourLabel(),
    lat: null, lon: null, geoError: null,
  });

  // Tracks the coordinates currently loaded in state
  const loadedCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // ── Fetch weather for a given coordinate pair ────────────────────────────────
  const fetchForCoords = useCallback(async (
    lat: number,
    lon: number,
    geoError: string | null,
    force = false,
  ) => {
    setState(s => ({ ...s, loading: true, error: null, lat, lon, geoError }));

    // Same clock-hour cache hit
    const cached = readCache(lat, lon);
    if (!force && cached && isSameHour(cached.fetchedAt)) {
      const todayStr = new Date().toISOString().slice(0, 10);
      loadedCoordsRef.current = { lat, lon };
      setState({
        loading: false, error: null,
        currentTempC: cached.currentTempC,
        days:         cached.days,
        forecast:     cached.days.filter(d => d.date >= todayStr),
        hourly:       cached.hourly,
        lastUpdated:  cached.fetchedAt,
        fromCache:    true,
        nextRefreshAt: nextHourLabel(),
        lat, lon, geoError,
      });
      return;
    }

    // Fresh API call
    try {
      const data  = await fetchOpenMeteo(lat, lon);
      const entry: CacheEntry = { ...data, fetchedAt: Date.now(), lat, lon };
      writeCache(entry);
      const todayStr = new Date().toISOString().slice(0, 10);
      loadedCoordsRef.current = { lat, lon };
      setState({
        loading: false, error: null,
        currentTempC: entry.currentTempC,
        days:         entry.days,
        forecast:     entry.days.filter(d => d.date >= todayStr),
        hourly:       entry.hourly,
        lastUpdated:  entry.fetchedAt,
        fromCache:    false,
        nextRefreshAt: nextHourLabel(),
        lat, lon, geoError,
      });
    } catch (err: any) {
      if (cached) {
        const todayStr = new Date().toISOString().slice(0, 10);
        loadedCoordsRef.current = { lat, lon };
        setState({
          loading: false, error: err.message,
          currentTempC: cached.currentTempC,
          days:         cached.days,
          forecast:     cached.days.filter(d => d.date >= todayStr),
          hourly:       cached.hourly,
          lastUpdated:  cached.fetchedAt,
          fromCache:    true,
          nextRefreshAt: nextHourLabel(),
          lat, lon, geoError,
        });
      } else {
        setState(s => ({
          ...s,
          loading: false, error: err.message,
          currentTempC: null, days: [], forecast: [], hourly: [],
          lastUpdated: null, fromCache: false,
          nextRefreshAt: nextHourLabel(),
          lat, lon, geoError,
        }));
      }
    }
  }, []);

  // ── On mount: load with fallback immediately, then upgrade when geo arrives ──
  useEffect(() => {
    // Phase 1 — start loading with fallback right away (no waiting for geo)
    fetchForCoords(FALLBACK_LAT, FALLBACK_LON, null);

    // Phase 2 — browser geo runs in parallel; when it resolves re-fetch if coords changed
    const stopWatch = watchBrowserLocation(
      (lat, lon) => {
        const prev = loadedCoordsRef.current;
        const sameSpot =
          prev &&
          Math.abs(prev.lat - lat) < 0.01 &&
          Math.abs(prev.lon - lon) < 0.01;
        if (!sameSpot) {
          fetchForCoords(lat, lon, null);
        }
      },
      (msg) => {
        // Geo denied/failed — keep the fallback data already shown, just update geoError
        setState(s => ({ ...s, geoError: msg }));
      },
    );

    return stopWatch;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh at next clock-hour boundary
  useEffect(() => {
    const msUntilNextHour = HOUR_MS - (Date.now() % HOUR_MS);
    const t = setTimeout(() => {
      const c = loadedCoordsRef.current;
      if (c) fetchForCoords(c.lat, c.lon, null, true);
    }, msUntilNextHour);
    return () => clearTimeout(t);
  }, [fetchForCoords, state.lastUpdated]);

  const refetch = useCallback(() => {
    const c = loadedCoordsRef.current;
    fetchForCoords(c?.lat ?? FALLBACK_LAT, c?.lon ?? FALLBACK_LON, null, true);
  }, [fetchForCoords]);

  return { ...state, refetch };
}

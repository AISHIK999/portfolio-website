import { ref } from "vue";
import axios from "axios";
import { getWakaChart, getWakaStats, getWakaLanguages } from "@/api/portfolio";
import type { WakaChartItem, WakaLanguage } from "@/types/portfolio";

export interface NowPlayingData {
  album: string;
  album_art: string;
  artist: string;
  song: string;
}

export interface WeatherData {
  temperature: number;
  city: string;
  weathercode: number;
}

export interface WakaData {
  chart: WakaChartItem[];
  languages: WakaLanguage[];
  totalHours: string;
  totalYears: string;
  dailyAverage: string;
  pythonTime: string;
}

// ── TTL constants ────────────────────────────────────────────────────────────
// Now-playing is refreshed at most once every 30 seconds (it changes often).
// Weather is refreshed at most once every 10 minutes.
// WakaTime stats are session-cached (fetched once; they're heavy API calls).
const NOW_PLAYING_TTL_MS = 30_000; // 30 s
const WEATHER_TTL_MS = 10 * 60_000; // 10 min

// ── Singleton state (module-level) ──────────────────────────────────────────
const nowPlaying = ref<NowPlayingData | null>(null);
const weather = ref<WeatherData | null>(null);
const wakaData = ref<WakaData | null>(null);

const loadingNowPlaying = ref(false);
const loadingWeather = ref(false);
const loadingWaka = ref(false);

const errorNowPlaying = ref<string | null>(null);
const errorWeather = ref<string | null>(null);
const errorWaka = ref<string | null>(null);

// Timestamps of the last successful fetch (for TTL checks)
let lastNowPlayingFetch = 0;
let lastWeatherFetch = 0;

// ── Fetch functions ──────────────────────────────────────────────────────────

async function fetchNowPlaying(force = false) {
  const stale = Date.now() - lastNowPlayingFetch > NOW_PLAYING_TTL_MS;
  if (!force && !stale && nowPlaying.value) return; // still fresh
  if (loadingNowPlaying.value) return;

  loadingNowPlaying.value = true;
  errorNowPlaying.value = null;
  try {
    const response = await axios.get(import.meta.env.VITE_NOW_PLAYING_URL);
    nowPlaying.value = response.data;
    lastNowPlayingFetch = Date.now();
  } catch (err: any) {
    console.error("Now playing fetch failed:", err);
    errorNowPlaying.value = err.message || "Failed to load now playing";
  } finally {
    loadingNowPlaying.value = false;
  }
}

async function fetchWeather(force = false) {
  const stale = Date.now() - lastWeatherFetch > WEATHER_TTL_MS;
  if (!force && !stale && weather.value) return; // still fresh
  if (loadingWeather.value) return;

  loadingWeather.value = true;
  errorWeather.value = null;
  try {
    const res = await axios.get(import.meta.env.VITE_WEATHER_API_URL);
    const data = res.data;
    weather.value = {
      temperature: Math.round(data.current_weather.temperature),
      city: "Change City Name",
      weathercode: data.current_weather.weathercode,
    };
    lastWeatherFetch = Date.now();
  } catch (err: any) {
    console.error("Weather fetch failed:", err);
    errorWeather.value = err.message || "Failed to load weather";
  } finally {
    loadingWeather.value = false;
  }
}

async function fetchWaka(force = false) {
  // WakaTime is session-cached — skip unless forced or never loaded
  if (!force && wakaData.value) return;
  if (loadingWaka.value) return;

  loadingWaka.value = true;
  errorWaka.value = null;
  try {
    const [chartRes, statsRes, langRes] = await Promise.all([
      getWakaChart(),
      getWakaStats(),
      getWakaLanguages(),
    ]);

    const rawData: WakaChartItem[] = chartRes.data.data;
    const statsData = statsRes.data.data;
    const languagesData: WakaLanguage[] = langRes.data.data;

    const totalHrs = (
      statsData.grand_total.total_seconds_including_other_language / 3600
    ).toFixed(1);
    const days = statsData.range.days_including_holidays;
    const yrs = (days / 365.25).toFixed(1);

    const avgSeconds =
      statsData.grand_total.daily_average_including_other_language;
    const dailyAvgHrs = (avgSeconds / 3600).toFixed(1);

    let pyTime = "0.0";
    const pythonLang = languagesData.find((l) => l.name === "Python");
    if (pythonLang) {
      if (pythonLang.total_seconds) {
        pyTime = `${(pythonLang.total_seconds / 3600).toFixed(1)} hours`;
      } else {
        const hrsMatch = pythonLang.text.match(/(\d+)\s*hrs?/);
        const minsMatch = pythonLang.text.match(/(\d+)\s*mins?/);
        const hrs = hrsMatch && hrsMatch[1] ? parseInt(hrsMatch[1]) : 0;
        const mins = minsMatch && minsMatch[1] ? parseInt(minsMatch[1]) : 0;
        pyTime = `${(hrs + mins / 60).toFixed(1)} hours`;
      }
    }

    wakaData.value = {
      chart: rawData,
      languages: languagesData,
      totalHours: totalHrs,
      totalYears: yrs,
      dailyAverage: dailyAvgHrs,
      pythonTime: pyTime.endsWith(" hours")
        ? pyTime.replace(" hours", "")
        : pyTime,
    };
  } catch (err: any) {
    console.error("WakaTime fetch failed:", err);
    errorWaka.value = err.message || "Failed to load WakaTime data";
  } finally {
    loadingWaka.value = false;
  }
}

// ── Composable ───────────────────────────────────────────────────────────────
export function useAboutWidgets() {
  return {
    nowPlaying,
    weather,
    wakaData,
    loadingNowPlaying,
    loadingWeather,
    loadingWaka,
    errorNowPlaying,
    errorWeather,
    errorWaka,
    fetchNowPlaying,
    fetchWeather,
    fetchWaka,
  };
}

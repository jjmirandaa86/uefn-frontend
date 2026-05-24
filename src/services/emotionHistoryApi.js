import { getAppSettingInt } from "../utils/appSettingsStore.js";
import { resolveAppCalendarDay } from "../utils/appTimezone.js";
import { getBackendApiUrl } from "../utils/emotionCapture.js";

const HISTORY_BASE = () => `${getBackendApiUrl()}/api/history`;

const DEFAULT_RECENT_LIMIT = 20;
const MAX_RECENT_LIMIT = 200;

/** Cantidad de filas del historial reciente (VITE_EMOTION_HISTORY_RECENT_LIMIT). */
export function getEmotionHistoryRecentLimit() {
  return getAppSettingInt("VITE_EMOTION_HISTORY_RECENT_LIMIT", DEFAULT_RECENT_LIMIT, {
    min: 1,
    max: MAX_RECENT_LIMIT,
  });
}

/**
 * @param {{ emocion: string; nivelConfianza: number; faceUser: string }} payload
 */
export async function postEmotionHistoryEntry(payload) {
  const res = await fetch(HISTORY_BASE(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emocion: payload.emocion,
      nivelConfianza: payload.nivelConfianza,
      faceUser: payload.faceUser,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }

  return res.json();
}

/**
 * @param {{ limit?: number; faceUser?: string | null }} [opts]
 */
export async function fetchRecentEmotionHistory(opts = {}) {
  const limit = opts.limit ?? getEmotionHistoryRecentLimit();
  const params = new URLSearchParams({ limit: String(limit) });
  if (opts.faceUser) {
    params.set("faceUser", opts.faceUser);
  }

  const res = await fetch(`${HISTORY_BASE()}/recent?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }

  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

/**
 * @param {{ date?: string; faceUser?: string | null }} [opts] date = YYYY-MM-DD (hoy por defecto)
 */
export async function fetchTodayHistorySummary(opts = {}) {
  const params = new URLSearchParams();
  const date = resolveAppCalendarDay(opts.date);
  params.set("date", date);
  if (opts.faceUser) {
    params.set("faceUser", opts.faceUser);
  }

  const res = await fetch(
    `${HISTORY_BASE()}/summary/today?${params.toString()}`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }

  const data = await res.json();
  return data.summary ?? null;
}

/**
 * Conteo por emoción del día actual (o `date` YYYY-MM-DD).
 * @param {{ date?: string; faceUser?: string | null }} [opts]
 */
export async function fetchTodayEmotionCounts(opts = {}) {
  const params = new URLSearchParams();
  const date = resolveAppCalendarDay(opts.date);
  params.set("date", date);
  if (opts.faceUser) {
    params.set("faceUser", opts.faceUser);
  }

  const res = await fetch(
    `${HISTORY_BASE()}/today/by-emotion?${params.toString()}`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }

  const data = await res.json();
  return {
    date: data.date ?? date,
    total: Number(data.total) || 0,
    byEmotion: Array.isArray(data.byEmotion) ? data.byEmotion : [],
  };
}

/** Estadísticas globales para gráfico (toda emotion_recent_history). */
export async function fetchEmotionHistoryStats() {
  const res = await fetch(`${HISTORY_BASE()}/stats`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }
  const data = await res.json();
  return {
    total: Number(data.total) || 0,
    byEmotion: Array.isArray(data.byEmotion) ? data.byEmotion : [],
  };
}

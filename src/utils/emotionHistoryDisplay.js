import { emotions } from "../data/emotions.js";
import {
  calendarDayInAppTz,
  getAppTimezone,
  parseInstant,
  yesterdayCalendarDayInAppTz,
} from "./appTimezone.js";

const EMOTION_BY_LABEL = Object.fromEntries(
  emotions.map((e) => [e.label.toLowerCase(), e]),
);

export function getEmotionDisplayMeta(label) {
  const key = String(label ?? "")
    .trim()
    .toLowerCase();
  return (
    EMOTION_BY_LABEL[key] ?? {
      label: label || "—",
      emoji: "😐",
      color: "#94a3b8",
    }
  );
}

/** @param {string | Date} createdAt */
export function formatHistoryClock(createdAt) {
  const d = parseInstant(createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es", {
    timeZone: getAppTimezone(),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** @param {string | Date} createdAt @returns {string} YYYY-MM-DD */
export function getHistoryDateKey(createdAt) {
  const d = parseInstant(createdAt);
  if (Number.isNaN(d.getTime())) return "unknown";
  return calendarDayInAppTz(d);
}

/** Etiqueta legible: Hoy, Ayer, o "19 may 2026". */
export function formatHistoryDateLabel(createdAt) {
  const d = parseInstant(createdAt);
  if (Number.isNaN(d.getTime())) return "—";

  const itemDay = calendarDayInAppTz(d);
  const today = calendarDayInAppTz();
  if (itemDay === today) return "Hoy";
  if (itemDay === yesterdayCalendarDayInAppTz()) return "Ayer";

  return new Intl.DateTimeFormat("es", {
    timeZone: getAppTimezone(),
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Agrupa ítems ya ordenados (más reciente primero) por día.
 * @param {Array<{ dateKey: string; dateLabel: string }>} items
 */
/**
 * Combina API /history/stats con catálogo local (colores y orden).
 * @param {{ total: number; byEmotion: Array<{ emocion: string; count: number; avgConfidence: number | null; sharePercent?: number }> }} api
 */
/**
 * Barras del modal "Emociones de hoy" (solo emociones con count > 0).
 * @param {{ total: number; byEmotion: Array<{ emocion: string; count: number }> }} api
 */
export function buildTodayEmotionBars(api) {
  const total = api.total || 0;
  const countByLabel = new Map();

  for (const row of api.byEmotion ?? []) {
    const key = String(row.emocion ?? "")
      .trim()
      .toLowerCase();
    if (!key) continue;
    countByLabel.set(key, Number(row.count) || 0);
  }

  const items = emotions
    .map((meta) => {
      const count =
        countByLabel.get(meta.label.toLowerCase()) ??
        countByLabel.get(meta.key) ??
        0;
      return {
        key: meta.key,
        label: meta.label,
        emoji: meta.emoji,
        color: meta.color,
        count,
        share: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    })
    .filter((item) => item.count > 0);

  const knownKeys = new Set(
    emotions.flatMap((meta) => [meta.key, meta.label.toLowerCase()]),
  );

  for (const [rawKey, count] of countByLabel) {
    if (count <= 0 || knownKeys.has(rawKey)) continue;
    const meta = getEmotionDisplayMeta(rawKey);
    items.push({
      key: rawKey,
      label: meta.label,
      emoji: meta.emoji,
      color: meta.color,
      count,
      share: total > 0 ? Math.round((count / total) * 100) : 0,
    });
  }

  items.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, "es");
  });

  const maxCount = items.length > 0 ? items[0].count : 1;

  return items.map((item) => ({
    ...item,
    barPercent: Math.max(8, Math.round((item.count / maxCount) * 100)),
  }));
}

export function buildEmotionStatsForChart(api) {
  const total = api.total || 0;
  const countByLabel = new Map();

  for (const row of api.byEmotion ?? []) {
    const key = String(row.emocion ?? "")
      .trim()
      .toLowerCase();
    if (!key) continue;
    countByLabel.set(key, {
      count: Number(row.count) || 0,
      avgConfidence:
        row.avgConfidence != null ? Number(row.avgConfidence) : null,
      sharePercent:
        row.sharePercent != null ? Number(row.sharePercent) : null,
    });
  }

  return emotions
    .map((meta) => {
      const stat =
        countByLabel.get(meta.label.toLowerCase()) ??
        countByLabel.get(meta.key);
      const count = stat?.count ?? 0;
      const share =
        stat?.sharePercent != null
          ? Math.round(stat.sharePercent)
          : total > 0
            ? Math.round((count / total) * 100)
            : 0;

      return {
        key: meta.key,
        label: meta.label,
        emoji: meta.emoji,
        color: meta.color,
        count,
        share,
        avgConfidence: stat?.avgConfidence ?? null,
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label, "es");
    });
}

export function groupHistoryItemsByDate(items) {
  /** @type {{ dateKey: string; dateLabel: string; items: typeof items }[]} */
  const groups = [];

  for (const item of items) {
    const last = groups[groups.length - 1];
    if (!last || last.dateKey !== item.dateKey) {
      groups.push({
        dateKey: item.dateKey,
        dateLabel: item.dateLabel,
        items: [item],
      });
    } else {
      last.items.push(item);
    }
  }

  return groups;
}

/** @param {{ id: number; emocion: string; nivelConfianza: number | null; faceUser: string; createdAt: string }} row */
export function mapApiHistoryToDisplayItem(row) {
  const meta = getEmotionDisplayMeta(row.emocion);
  const dateKey = getHistoryDateKey(row.createdAt);
  return {
    id: row.id,
    createdAt: row.createdAt,
    dateKey,
    dateLabel: formatHistoryDateLabel(row.createdAt),
    time: formatHistoryClock(row.createdAt),
    label: row.emocion ?? meta.label,
    emoji: meta.emoji,
    color: meta.color,
    nivelConfianza: row.nivelConfianza,
    faceUser: row.faceUser,
  };
}

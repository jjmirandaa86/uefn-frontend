/**
 * Zona horaria de negocio (alineada con uefn-backend APP_TIMEZONE).
 * Instante de captura: ISO UTC en metadata.fechaCaptura.
 * Día calendario / carpetas / ?date=: VITE_APP_TIMEZONE (Australia/Sydney por defecto).
 */

import { getRuntimeEnv } from "../config/runtimeEnv.js";

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** @returns {string} IANA timezone, ej. Australia/Sydney */
export function getAppTimezone() {
  const tz =
    getRuntimeEnv("VITE_APP_TIMEZONE") ||
    String(import.meta.env.VITE_APP_TIMEZONE || "").trim() ||
    "Australia/Sydney";
  return tz || "Australia/Sydney";
}

/**
 * @param {string | Date | number} value
 * @returns {Date}
 */
export function parseInstant(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date() : value;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/**
 * @param {number} utcMs
 * @param {string} [timeZone]
 */
export function getZonedParts(utcMs, timeZone = getAppTimezone()) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });
  const map = Object.fromEntries(
    dtf
      .formatToParts(new Date(utcMs))
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value]),
  );
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

/**
 * @param {ReturnType<typeof getZonedParts>} parts
 * @param {{ year: number; month: number; day: number; hour: number; minute: number; second: number }} target
 */
function compareZonedParts(parts, target) {
  if (parts.year !== target.year) return parts.year - target.year;
  if (parts.month !== target.month) return parts.month - target.month;
  if (parts.day !== target.day) return parts.day - target.day;
  if (parts.hour !== target.hour) return parts.hour - target.hour;
  if (parts.minute !== target.minute) return parts.minute - target.minute;
  return parts.second - target.second;
}

/**
 * @param {number} year
 * @param {number} month 1-12
 * @param {number} day
 * @param {number} [hour]
 * @param {number} [minute]
 * @param {number} [second]
 * @param {number} [ms]
 * @param {string} [timeZone]
 */
export function zonedLocalToUtc(
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0,
  timeZone = getAppTimezone(),
) {
  const target = { year, month, day, hour, minute, second };
  let low = Date.UTC(year, month - 1, day - 1, 0, 0, 0, 0);
  let high = Date.UTC(year, month - 1, day + 2, 0, 0, 0, 0);

  let best = Math.floor((low + high) / 2);

  for (let i = 0; i < 64; i++) {
    const mid = Math.floor((low + high) / 2);
    const cmp = compareZonedParts(getZonedParts(mid, timeZone), target);
    if (cmp === 0) {
      best = mid;
      break;
    }
    best = mid;
    if (cmp < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  let candidate = null;
  for (let t = best - 2000; t <= best + 2000; t += 1) {
    if (compareZonedParts(getZonedParts(t, timeZone), target) === 0) {
      if (candidate === null || t < candidate) {
        candidate = t;
      }
    }
  }
  if (candidate !== null) {
    return new Date(candidate - ms);
  }

  let t = best;
  for (let i = 0; i < 120; i++) {
    const cmp = compareZonedParts(getZonedParts(t, timeZone), target);
    if (cmp === 0) {
      return new Date(t - ms);
    }
    t += cmp < 0 ? 1000 : -1000;
  }

  return new Date(best - ms);
}

/**
 * Día calendario YYYY-MM-DD en la zona de la app.
 * @param {string | Date | number} [value]
 * @param {string} [timeZone]
 */
export function calendarDayInAppTz(value = new Date(), timeZone = getAppTimezone()) {
  const d = parseInstant(value);
  const p = getZonedParts(d.getTime(), timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/**
 * @param {string | Date | undefined | null} [date]
 */
export function resolveAppCalendarDay(date) {
  if (typeof date === "string") {
    const trimmed = date.trim();
    if (DATE_ONLY_RE.test(trimmed)) {
      return trimmed;
    }
  }
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return calendarDayInAppTz(date);
  }
  return calendarDayInAppTz(new Date());
}

/**
 * @param {string} calendarDay YYYY-MM-DD
 * @param {string} [timeZone]
 * @returns {{ calendarDay: string; startUtc: Date; endUtc: Date }}
 */
export function dayBoundsUtc(calendarDay, timeZone = getAppTimezone()) {
  const match = DATE_ONLY_RE.exec(String(calendarDay).trim());
  if (!match) {
    throw new Error(`Día calendario inválido: ${calendarDay}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const startUtc = zonedLocalToUtc(year, month, day, 0, 0, 0, 0, timeZone);

  const nextDay = calendarDayInAppTz(
    startUtc.getTime() + 25 * 3_600_000,
    timeZone,
  );
  const nextMatch = DATE_ONLY_RE.exec(nextDay);
  if (!nextMatch) {
    throw new Error(`No se pudo calcular el fin del día para ${calendarDay}`);
  }
  const endUtc = zonedLocalToUtc(
    Number(nextMatch[1]),
    Number(nextMatch[2]),
    Number(nextMatch[3]),
    0,
    0,
    0,
    0,
    timeZone,
  );

  return { calendarDay: `${match[1]}-${match[2]}-${match[3]}`, startUtc, endUtc };
}

/** Día anterior al calendario de hoy en APP_TIMEZONE. */
export function yesterdayCalendarDayInAppTz(timeZone = getAppTimezone()) {
  const today = calendarDayInAppTz(new Date(), timeZone);
  const { startUtc } = dayBoundsUtc(today, timeZone);
  return calendarDayInAppTz(startUtc.getTime() - 1, timeZone);
}

/**
 * Carpeta uploads: YYYY-MM-DD según día de negocio.
 * @param {string | Date | number} [value]
 */
export function dateFolderFromCapture(value = new Date()) {
  if (typeof value === "string" && DATE_ONLY_RE.test(value.trim())) {
    return value.trim();
  }
  return calendarDayInAppTz(value);
}

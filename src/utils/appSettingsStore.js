import { APP_SETTING_FIELDS } from "../config/appSettingsFields.js";
import { getRuntimeEnv } from "../config/runtimeEnv.js";

const STORAGE_KEY = "uefn_app_settings";

export const APP_SETTINGS_UPDATED_EVENT = "uefn-app-settings-updated";

/** @returns {Record<string, string>} */
export function loadStoredAppSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Valores por defecto leídos del .env en build. */
export function getDefaultAppSettings() {
  /** @type {Record<string, string>} */
  const out = {};
  for (const field of APP_SETTING_FIELDS) {
    const envVal = getRuntimeEnv(field.key) || import.meta.env[field.key];
    out[field.key] =
      envVal !== undefined && String(envVal).trim() !== ""
        ? String(envVal).trim()
        : String(field.fallback ?? "");
  }
  return out;
}

/** Mezcla .env + overrides guardados en el navegador. */
export function getEffectiveAppSettings() {
  return { ...getDefaultAppSettings(), ...loadStoredAppSettings() };
}

/** @param {Record<string, string>} values */
export function saveAppSettings(values) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  window.dispatchEvent(new CustomEvent(APP_SETTINGS_UPDATED_EVENT));
}

export function clearStoredAppSettings() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(APP_SETTINGS_UPDATED_EVENT));
}

/**
 * Quita URL http:// del API guardada en el navegador si la app va en HTTPS
 * (evita mixed content y saltarse el proxy de Vite).
 */
export function migrateAppSettingsForHttps() {
  if (typeof window === "undefined" || window.location.protocol !== "https:") {
    return;
  }
  const stored = loadStoredAppSettings();
  const url = stored.VITE_BACKEND_URL;
  if (!url) return;
  let changed = false;
  const next = { ...stored };

  try {
    if (new URL(url).protocol === "http:") {
      delete next.VITE_BACKEND_URL;
      changed = true;
    }
  } catch {
    delete next.VITE_BACKEND_URL;
    changed = true;
  }

  if (next.VITE_EMOTION_CAPTURE_MIN_DOMINANCE === "15") {
    next.VITE_EMOTION_CAPTURE_MIN_DOMINANCE = "8";
    changed = true;
  }
  if (next.VITE_EMOTION_CAPTURE_MIN_SCORE === "0.42") {
    next.VITE_EMOTION_CAPTURE_MIN_SCORE = "0.35";
    changed = true;
  }

  if (changed) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(APP_SETTINGS_UPDATED_EVENT));
    console.info("[MoodVision] Ajustes locales migrados para HTTPS y captura.");
  }
}

/**
 * @param {string} key
 * @param {string} [fallback]
 */
export function getAppSettingString(key, fallback = "") {
  const stored = loadStoredAppSettings()[key];
  if (stored !== undefined && String(stored).trim() !== "") {
    return String(stored).trim();
  }
  const runtime = getRuntimeEnv(key);
  if (runtime !== "") {
    return runtime;
  }
  const env = import.meta.env[key];
  if (env !== undefined && String(env).trim() !== "") {
    return String(env).trim();
  }
  return fallback;
}

/**
 * @param {string} key
 * @param {number} fallback
 * @param {{ min?: number; max?: number }} [opts]
 */
export function getAppSettingInt(key, fallback, opts = {}) {
  const raw = getAppSettingString(key, String(fallback));
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = opts;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * @param {string} key
 * @param {number} fallback
 * @param {{ min?: number; max?: number }} [opts]
 */
export function getAppSettingFloat(key, fallback, opts = {}) {
  const raw = getAppSettingString(key, String(fallback));
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const { min = 0, max = 1 } = opts;
  return Math.min(max, Math.max(min, n));
}

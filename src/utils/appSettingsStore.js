import { APP_SETTING_FIELDS } from "../config/appSettingsFields.js";

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
    const envVal = import.meta.env[field.key];
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
 * @param {string} key
 * @param {string} [fallback]
 */
export function getAppSettingString(key, fallback = "") {
  const stored = loadStoredAppSettings()[key];
  if (stored !== undefined && String(stored).trim() !== "") {
    return String(stored).trim();
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

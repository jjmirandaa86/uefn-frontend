import { getRuntimeEnv } from "../config/runtimeEnv.js";
import { getAppSettingString } from "./appSettingsStore.js";

/**
 * URL base del API (sin barra final).
 * En desarrollo usa siempre el mismo origen → proxy Vite (HTTPS → HTTP :3006).
 */
export function getBackendApiUrl() {
  if (import.meta.env.DEV && typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const raw = getAppSettingString("VITE_BACKEND_URL", "").trim();
  if (!raw) {
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    const fromEnv = getRuntimeEnv("VITE_BACKEND_URL");
    if (fromEnv) {
      return fromEnv.replace(/\/$/, "");
    }
    return "http://localhost:3006";
  }

  const base = raw.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location?.protocol === "https:") {
    try {
      if (new URL(base).protocol === "http:") {
        return window.location.origin;
      }
    } catch {
      return window.location.origin;
    }
  }

  return base;
}

/** Comprueba conexión con el backend (GET /health). */
export async function pingBackendHealth() {
  const url = `${getBackendApiUrl()}/health`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`health ${res.status}`);
  }
  return res.json();
}

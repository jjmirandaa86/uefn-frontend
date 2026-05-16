const STORAGE_KEY = "uefn-emotion-history-root";
const MAX_RECORDS = 8000;

/** Plantilla en memoria si no hay localStorage ni fetch aún. */
const EMPTY_ROOT = Object.freeze({
  version: 1,
  records: [],
});

function cloneDefault() {
  return { version: EMPTY_ROOT.version, records: [...EMPTY_ROOT.records] };
}

/**
 * Carga el documento desde localStorage. Si no hay datos, usa la plantilla vacía.
 * El JSON en `public/data/emotionHistory.json` solo se puede leer por HTTP (GET);
 * el navegador no puede escribir ahí: los ticks se persisten en localStorage.
 */
export function loadEmotionHistoryRoot() {
  if (typeof window === "undefined") return cloneDefault();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.records)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return cloneDefault();
}

export function saveEmotionHistoryRoot(root) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(root));
  } catch {
    /* quota u otro */
  }
}

/**
 * Si no hay nada en localStorage, copia el contenido de `/data/emotionHistory.json`
 * (archivo en `public/data/`) para poder editar la plantilla sin rebuild.
 */
export async function seedEmotionHistoryFromPublicJson() {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const base = import.meta.env.BASE_URL || "/";
    const prefix = base.endsWith("/") ? base : `${base}/`;
    const res = await fetch(`${prefix}data/emotionHistory.json`);
    if (!res.ok) return;
    const data = await res.json();
    if (data && Array.isArray(data.records)) {
      saveEmotionHistoryRoot({
        version: typeof data.version === "number" ? data.version : 1,
        records: [...data.records],
      });
    }
  } catch {
    /* red o JSON inválido */
  }
}

/**
 * Añade un tick de sesión en localStorage (misma forma que `public/data/emotionHistory.json`).
 */
export function appendEmotionHistoryRecord(sessionStartedAt, entry) {
  const root = loadEmotionHistoryRoot();
  root.records.unshift({
    sessionStartedAt,
    ...entry,
  });
  if (root.records.length > MAX_RECORDS) {
    root.records.length = MAX_RECORDS;
  }
  saveEmotionHistoryRoot(root);
}

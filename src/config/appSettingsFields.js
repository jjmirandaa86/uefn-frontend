/**
 * Parámetros editables (valores por defecto desde VITE_* en .env).
 * @typedef {'string' | 'int' | 'float' | 'url'} AppSettingType
 * @typedef {{
 *   key: string;
 *   title: string;
 *   description: string;
 *   type: AppSettingType;
 *   group: string;
 *   fallback?: string | number;
 *   min?: number;
 *   max?: number;
 *   step?: number;
 * }} AppSettingField
 */

/** @type {AppSettingField[]} */
export const APP_SETTING_FIELDS = [
  {
    key: "VITE_BACKEND_URL",
    title: "URL del backend",
    description:
      "Dirección base de la API Node. Vacío = mismo origen (dev HTTPS + proxy). Producción: URL pública sin barra final.",
    type: "url",
    group: "API y listados",
    fallback: "",
  },
  {
    key: "VITE_EMOTION_HISTORY_RECENT_LIMIT",
    title: "Historial reciente (cantidad)",
    description:
      "Número de registros que pide el modal «Historial reciente» al endpoint GET /api/history/recent?limit=N.",
    type: "int",
    group: "API y listados",
    fallback: 24,
    min: 1,
    max: 200,
  },
  {
    key: "VITE_FUN_MOMENTS_PAGE_SIZE",
    title: "Momentos divertidos (por página)",
    description:
      "Cuántas miniaturas procesadas se muestran por página en el modal «Momentos divertidos». El valor se envía al backend en limit=.",
    type: "int",
    group: "API y listados",
    fallback: 8,
    min: 1,
    max: 200,
  },
  {
    key: "VITE_EMOTION_CAPTURE_DELAY_MS",
    title: "Retardo antes de capturar (ms)",
    description:
      "Tiempo que debe mantenerse la misma emoción clara antes de enviar la foto al servidor.",
    type: "int",
    group: "Captura automática",
    fallback: 2500,
    min: 0,
    max: 60000,
  },
  {
    key: "VITE_EMOTION_CAPTURE_MIN_CONFIDENCE",
    title: "Confianza mínima (%)",
    description:
      "Porcentaje mínimo de confianza para capturar emociones expresivas (feliz, triste, enojado, etc.).",
    type: "int",
    group: "Captura automática",
    fallback: 48,
    min: 10,
    max: 95,
  },
  {
    key: "VITE_EMOTION_CAPTURE_NEUTRAL_MIN_CONFIDENCE",
    title: "Confianza mínima neutral (%)",
    description:
      "Umbral más alto para la emoción neutral, porque suele ser más ambigua.",
    type: "int",
    group: "Captura automática",
    fallback: 58,
    min: 10,
    max: 95,
  },
  {
    key: "VITE_EMOTION_CAPTURE_MIN_DOMINANCE",
    title: "Dominancia mínima (puntos %)",
    description:
      "Diferencia mínima entre la primera y la segunda emoción detectada. Evita capturas cuando hay empate.",
    type: "int",
    group: "Captura automática",
    fallback: 15,
    min: 0,
    max: 80,
  },
  {
    key: "VITE_EMOTION_CAPTURE_MIN_SCORE",
    title: "Score face-api mínimo",
    description:
      "Probabilidad bruta (0–1) de la emoción dominante según face-api. Valores más altos exigen señal más fuerte.",
    type: "float",
    group: "Captura automática",
    fallback: 0.42,
    min: 0.05,
    max: 0.95,
    step: 0.01,
  },
  {
    key: "VITE_EMOTION_CAPTURE_CONFIDENCE_HYSTERESIS",
    title: "Histéresis de confianza (%)",
    description:
      "Tolerancia de caída de confianza durante la espera antes de reiniciar el temporizador de captura.",
    type: "int",
    group: "Captura automática",
    fallback: 8,
    min: 0,
    max: 30,
  },
];

/** Tarjetas agrupadas por tema (columnas 1 = ancho completo). */
export const APP_SETTING_CARDS = [
  {
    id: "api",
    title: "Conexión con el servidor",
    description: "Dirección de la API para capturas, historial y momentos divertidos.",
    fieldKeys: ["VITE_BACKEND_URL"],
    columns: 1,
  },
  {
    id: "modals",
    title: "Modales y paginación",
    description: "Cuántos registros o imágenes se cargan en cada vista del dashboard.",
    fieldKeys: [
      "VITE_EMOTION_HISTORY_RECENT_LIMIT",
      "VITE_FUN_MOMENTS_PAGE_SIZE",
    ],
    columns: 2,
  },
  {
    id: "capture-timing",
    title: "Tiempo de captura",
    description: "Retardo e tolerancia antes de enviar una foto al backend.",
    fieldKeys: [
      "VITE_EMOTION_CAPTURE_DELAY_MS",
      "VITE_EMOTION_CAPTURE_CONFIDENCE_HYSTERESIS",
    ],
    columns: 2,
  },
  {
    id: "capture-confidence",
    title: "Umbrales de confianza",
    description: "Condiciones para considerar una emoción lo bastante clara como para capturar.",
    fieldKeys: [
      "VITE_EMOTION_CAPTURE_MIN_CONFIDENCE",
      "VITE_EMOTION_CAPTURE_NEUTRAL_MIN_CONFIDENCE",
      "VITE_EMOTION_CAPTURE_MIN_DOMINANCE",
      "VITE_EMOTION_CAPTURE_MIN_SCORE",
    ],
    columns: 2,
  },
];

/** @returns {Map<string, AppSettingField>} */
export function getAppSettingFieldMap() {
  return new Map(APP_SETTING_FIELDS.map((f) => [f.key, f]));
}

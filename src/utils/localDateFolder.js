/**
 * Reexporta utilidades de fecha (zona única del proyecto, alineada con el backend).
 */
import { dateFolderFromCapture } from "./appTimezone.js";

export {
  calendarDayInAppTz,
  dateFolderFromCapture,
  getAppTimezone,
  resolveAppCalendarDay,
} from "./appTimezone.js";

/**
 * Carpeta YYYY-MM-DD en día de negocio (VITE_APP_TIMEZONE).
 * @param {number} [timestampMs]
 * @returns {string}
 */
export function getLocalDateFolder(timestampMs = Date.now()) {
  return dateFolderFromCapture(timestampMs);
}

import { useCallback, useEffect, useState } from "react";
import { fetchTodayHistorySummary } from "../services/emotionHistoryApi.js";
import {
  getAppTimezone,
  parseInstant,
  resolveAppCalendarDay,
} from "../utils/appTimezone.js";
import { EMOTION_HISTORY_STORED_EVENT } from "./useEmotionHistoryRecorder.js";

function formatLastDetection(value) {
  if (!value) return "—";
  const d = parseInstant(value);
  return new Intl.DateTimeFormat("es", {
    timeZone: getAppTimezone(),
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

const EMPTY = {
  deteccionesHoy: "0",
  emocionDominante: "—",
  promedioConfianza: "—",
  ultimaDeteccion: "—",
};

/**
 * @param {{ faceUser?: string | null }} [opts]
 */
export function useTodayEmotionSummary({ faceUser = null } = {}) {
  const [rows, setRows] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await fetchTodayHistorySummary({
        date: resolveAppCalendarDay(),
        faceUser: faceUser ?? undefined,
      });

      if (!summary) {
        setRows(EMPTY);
        return;
      }

      setRows({
        deteccionesHoy: String(summary.deteccionesHoy ?? 0),
        emocionDominante: summary.emocionDominante ?? "—",
        promedioConfianza:
          summary.promedioConfianza != null
            ? `${summary.promedioConfianza}%`
            : "—",
        ultimaDeteccion: formatLastDetection(summary.ultimaDeteccion),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar resumen");
      setRows(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [faceUser]);

  useEffect(() => {
    void refresh();
    const onStored = () => {
      void refresh();
    };
    window.addEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
    return () =>
      window.removeEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
  }, [refresh]);

  return { rows, loading, error, refresh };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchEmotionHistoryStats } from "../services/emotionHistoryApi.js";
import { buildEmotionStatsForChart } from "../utils/emotionHistoryDisplay.js";
import { EMOTION_HISTORY_STORED_EVENT } from "./useEmotionHistoryRecorder.js";

/**
 * @param {{ enabled?: boolean }} [opts]
 */
export function useEmotionHistoryStats({ enabled = true } = {}) {
  const [apiStats, setApiStats] = useState({ total: 0, byEmotion: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmotionHistoryStats();
      setApiStats(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudieron cargar las estadísticas",
      );
      setApiStats({ total: 0, byEmotion: [] });
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    void refresh();
    const onStored = () => {
      void refresh();
    };
    window.addEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
    return () => window.removeEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
  }, [enabled, refresh]);

  const rows = useMemo(
    () => buildEmotionStatsForChart(apiStats),
    [apiStats],
  );

  return {
    total: apiStats.total,
    rows,
    loading,
    error,
    refresh,
  };
}

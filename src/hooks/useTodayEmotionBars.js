import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchTodayEmotionCounts } from "../services/emotionHistoryApi.js";
import { buildTodayEmotionBars } from "../utils/emotionHistoryDisplay.js";
import { EMOTION_HISTORY_STORED_EVENT } from "./useEmotionHistoryRecorder.js";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * @param {{ enabled?: boolean; faceUser?: string | null }} [opts]
 */
export function useTodayEmotionBars({ enabled = true, faceUser = null } = {}) {
  const [apiData, setApiData] = useState({ total: 0, byEmotion: [], date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodayEmotionCounts({
        date: todayIsoDate(),
        faceUser: faceUser ?? undefined,
      });
      setApiData(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar las emociones de hoy",
      );
      setApiData({ total: 0, byEmotion: [], date: todayIsoDate() });
    } finally {
      setLoading(false);
    }
  }, [enabled, faceUser]);

  useEffect(() => {
    if (!enabled) return undefined;
    void refresh();
    const onStored = () => {
      void refresh();
    };
    window.addEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
    return () => window.removeEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
  }, [enabled, refresh]);

  const bars = useMemo(() => buildTodayEmotionBars(apiData), [apiData]);

  return {
    bars,
    total: apiData.total,
    date: apiData.date,
    loading,
    error,
    refresh,
  };
}

import { useCallback, useEffect, useState } from "react";
import {
  fetchRecentEmotionHistory,
  getEmotionHistoryRecentLimit,
} from "../services/emotionHistoryApi.js";
import { mapApiHistoryToDisplayItem } from "../utils/emotionHistoryDisplay.js";
import { EMOTION_HISTORY_STORED_EVENT } from "./useEmotionHistoryRecorder.js";

/**
 * @param {{ limit?: number; faceUser?: string | null; enabled?: boolean }} opts
 */
export function useRecentEmotionHistory({
  limit = getEmotionHistoryRecentLimit(),
  faceUser = null,
  enabled = true,
} = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchRecentEmotionHistory({
        limit,
        faceUser: faceUser ?? undefined,
      });
      setItems(rows.map(mapApiHistoryToDisplayItem));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el historial");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, faceUser, limit]);

  useEffect(() => {
    if (!enabled) return undefined;
    void refresh();
    const onStored = () => {
      void refresh();
    };
    window.addEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
    return () => window.removeEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
  }, [enabled, refresh]);

  return { items, loading, error, refresh, limit };
}

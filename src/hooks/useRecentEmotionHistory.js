import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchRecentEmotionHistory,
  getEmotionHistoryRecentLimit,
} from "../services/emotionHistoryApi.js";
import { mapApiHistoryRowsToDisplayItems } from "../utils/emotionHistoryDisplay.js";
import {
  getCachedRecentHistoryItems,
  setCachedRecentHistoryItems,
} from "../utils/recentHistoryCache.js";
import { EMOTION_HISTORY_STORED_EVENT } from "./useEmotionHistoryRecorder.js";

/**
 * @param {{ limit?: number; faceUser?: string | null; enabled?: boolean; refreshOnStored?: boolean }} opts
 */
export function useRecentEmotionHistory({
  limit = getEmotionHistoryRecentLimit(),
  faceUser = null,
  enabled = true,
  refreshOnStored = true,
} = {}) {
  const [items, setItems] = useState(() => getCachedRecentHistoryItems() ?? []);
  const [loading, setLoading] = useState(
    () => (getCachedRecentHistoryItems()?.length ?? 0) === 0,
  );
  const [error, setError] = useState(null);
  const staleRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    const cached = getCachedRecentHistoryItems();
    if (cached?.length) {
      setItems(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const rows = await fetchRecentEmotionHistory({
        limit,
        faceUser: faceUser ?? undefined,
      });
      if (staleRef.current) return;

      const mapped = mapApiHistoryRowsToDisplayItems(rows);
      if (staleRef.current) return;

      setCachedRecentHistoryItems(mapped);
      setItems(mapped);
    } catch (e) {
      if (staleRef.current) return;
      setError(
        e instanceof Error ? e.message : "No se pudo cargar el historial",
      );
      if (!getCachedRecentHistoryItems()?.length) {
        setItems([]);
      }
    } finally {
      if (!staleRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, faceUser, limit]);

  useEffect(() => {
    if (!enabled) {
      staleRef.current = true;
      return undefined;
    }

    staleRef.current = false;

    void refresh();

    if (!refreshOnStored) {
      return () => {
        staleRef.current = true;
      };
    }

    const onStored = () => {
      if (!staleRef.current) void refresh();
    };
    window.addEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
    return () => {
      staleRef.current = true;
      window.removeEventListener(EMOTION_HISTORY_STORED_EVENT, onStored);
    };
  }, [enabled, refresh, refreshOnStored]);

  return { items, loading, error, refresh, limit };
}

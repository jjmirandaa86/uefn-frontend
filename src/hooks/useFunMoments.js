import { useCallback, useEffect, useState } from "react";
import {
  fetchProcessedCaptures,
  getFunMomentsPageSize,
} from "../services/funMomentsApi.js";
import { mapProcessedCaptureToDisplayItem } from "../utils/funMomentsDisplay.js";

/**
 * @param {{ pageSize?: number; faceUser?: string | null; enabled?: boolean }} opts
 */
export function useFunMoments({
  pageSize = getFunMomentsPageSize(),
  faceUser = null,
  enabled = true,
} = {}) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasNewer, setHasNewer] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPage = useCallback(
    async (nextOffset) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        const { items: rows, pagination } = await fetchProcessedCaptures({
          limit: pageSize,
          offset: nextOffset,
          faceUser: faceUser ?? undefined,
        });
        setItems(rows.map(mapProcessedCaptureToDisplayItem));
        setOffset(pagination.offset ?? nextOffset);
        setTotal(pagination.total ?? 0);
        setHasNewer(Boolean(pagination.hasNewer));
        setHasOlder(Boolean(pagination.hasOlder));
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "No se pudieron cargar las imágenes",
        );
        setItems([]);
        setTotal(0);
        setHasNewer(false);
        setHasOlder(false);
      } finally {
        setLoading(false);
      }
    },
    [enabled, faceUser, pageSize],
  );

  const goNewer = useCallback(() => {
    const next = Math.max(0, offset - pageSize);
    void loadPage(next);
  }, [loadPage, offset, pageSize]);

  const goOlder = useCallback(() => {
    void loadPage(offset + pageSize);
  }, [loadPage, offset, pageSize]);

  useEffect(() => {
    if (!enabled) return undefined;
    setOffset(0);
    void loadPage(0);
    return undefined;
  }, [enabled, faceUser, pageSize, loadPage]);

  const pageIndex = Math.floor(offset / pageSize) + 1;
  const pageCount = total > 0 ? Math.ceil(total / pageSize) : 0;

  return {
    items,
    loading,
    error,
    pageSize,
    offset,
    total,
    pageIndex,
    pageCount,
    hasNewer,
    hasOlder,
    goNewer,
    goOlder,
    refresh: () => loadPage(offset),
  };
}

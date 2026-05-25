import {
  fetchRecentEmotionHistory,
  getEmotionHistoryRecentLimit,
} from "../services/emotionHistoryApi.js";
import { mapApiHistoryRowsToDisplayItems } from "./emotionHistoryDisplay.js";

/** @type {ReturnType<typeof mapApiHistoryToDisplayItem>[] | null} */
let cachedItems = null;
/** @type {Promise<typeof cachedItems> | null} */
let inflight = null;

export function getCachedRecentHistoryItems() {
  return cachedItems;
}

export function setCachedRecentHistoryItems(items) {
  cachedItems = items;
}

export function prefetchRecentEmotionHistory(limit = getEmotionHistoryRecentLimit()) {
  if (cachedItems) return Promise.resolve(cachedItems);
  if (inflight) return inflight;
  inflight = fetchRecentEmotionHistory({ limit })
    .then((rows) => {
      cachedItems = mapApiHistoryRowsToDisplayItems(rows);
      return cachedItems;
    })
    .catch(() => {
      inflight = null;
      return null;
    });
  return inflight;
}

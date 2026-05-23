import { getAppSettingInt } from "../utils/appSettingsStore.js";
import { getBackendApiUrl } from "../utils/emotionCapture.js";

const CAPTURES_BASE = () => `${getBackendApiUrl()}/api/captures`;

const DEFAULT_PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 200;

/** Tamaño de página del modal Momentos divertidos (VITE_FUN_MOMENTS_PAGE_SIZE). */
export function getFunMomentsPageSize() {
  return getAppSettingInt("VITE_FUN_MOMENTS_PAGE_SIZE", DEFAULT_PAGE_SIZE, {
    min: 1,
    max: MAX_PAGE_SIZE,
  });
}

/**
 * @param {{ limit?: number; offset?: number; faceUser?: string | null }} [opts]
 */
export async function fetchProcessedCaptures(opts = {}) {
  const limit = opts.limit ?? getFunMomentsPageSize();
  const offset = opts.offset ?? 0;
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (opts.faceUser) {
    params.set("faceUser", opts.faceUser);
  }

  const res = await fetch(
    `${CAPTURES_BASE()}/processed?${params.toString()}`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }

  const data = await res.json();
  return {
    items: Array.isArray(data.items) ? data.items : [],
    pagination: data.pagination ?? {
      limit,
      offset,
      total: 0,
      count: 0,
      hasNewer: false,
      hasOlder: false,
    },
  };
}

import { resolveCaptureMediaUrl } from "./emotionCapture.js";
import {
  formatHistoryClock,
  formatHistoryDateLabel,
  getEmotionDisplayMeta,
} from "./emotionHistoryDisplay.js";

/**
 * @param {{
 *   id: number;
 *   imageUrl: string;
 *   emocion: string;
 *   fechaCaptura: string;
 *   nivelConfianza?: number | null;
 * }} item
 */
export function mapProcessedCaptureToDisplayItem(item) {
  const meta = getEmotionDisplayMeta(item.emocion);
  return {
    id: item.id,
    imageUrl: resolveCaptureMediaUrl(item),
    nombreArchivo: item.nombreArchivo ?? null,
    emocion: item.emocion,
    emoji: meta.emoji,
    color: meta.color,
    time: formatHistoryClock(item.fechaCaptura),
    dateLabel: formatHistoryDateLabel(item.fechaCaptura),
    nivelConfianza:
      item.nivelConfianza != null ? Number(item.nivelConfianza) : null,
  };
}

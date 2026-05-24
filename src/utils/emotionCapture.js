import { getBackendApiUrl } from "./backendApiUrl.js";
import { getEmotionCapturePolicy } from "./emotionCapturePolicy.js";
import { getLocalDateFolder } from "./localDateFolder.js";

export { getBackendApiUrl };

/** @deprecated Usar getEmotionCapturePolicy().delayMs */
export function getEmotionCaptureDelayMs() {
  return getEmotionCapturePolicy().delayMs;
}

/**
 * URL absoluta de una imagen de captura servida bajo /media/*.
 * Usa VITE_BACKEND_URL del frontend (no el host que devuelva el API).
 *
 * @param {{
 *   imageUrl?: string | null;
 *   rutaAlmacenamiento?: string | null;
 *   rutaAlmacenamientoDivertida?: string | null;
 * }} capture
 */
export function resolveCaptureMediaUrl(capture) {
  const rel = String(
    capture.rutaAlmacenamientoDivertida ??
      capture.rutaAlmacenamiento ??
      "",
  )
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\//, "");

  if (rel) {
    return `${getBackendApiUrl()}/media/${rel}`;
  }

  const raw = capture.imageUrl;
  if (!raw) return "";

  try {
    const pathname = new URL(raw).pathname;
    if (pathname.startsWith("/media/")) {
      return `${getBackendApiUrl()}${pathname}`;
    }
  } catch {
  }

  return raw;
}

export function getEmotionCapturesEndpoint() {
  return `${getBackendApiUrl()}/api/captures`;
}

/** Umbral FaceMatcher / face-api usado para asignar `user` (rostro). */
export const FACE_MATCH_THRESHOLD = 0.6;

export function sanitizeFilenamePart(value, fallback = "unknown") {
  return (
    String(value ?? "")
      .trim()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^\w.-]+/g, "_")
      .replace(/^_+|_+$/g, "") || fallback
  );
}

/**
 * Clave única día + rostro + emoción (sesión en memoria).
 * Incluye la fecha local para permitir una captura por emoción cada día nuevo.
 */
export function faceEmotionSlotKey(
  faceId,
  emotionKey,
  dateFolder = getLocalDateFolder(),
) {
  return `${dateFolder}:${sanitizeFilenamePart(faceId, "face")}:${sanitizeFilenamePart(emotionKey, "neutral")}`;
}

/**
 * @param {string} faceId
 * @param {{ key: string; label: string; confidence: number }} emotion
 */
export function buildEmotionCaptureFilename(faceId, emotion) {
  const id = sanitizeFilenamePart(faceId, "face");
  const name = sanitizeFilenamePart(emotion.label, "neutral");
  const conf = Math.max(
    1,
    Math.min(100, Math.round(Number(emotion.confidence) || 1)),
  );
  return `${id}_${name}_${conf}.png`;
}

/**
 * @param {string} faceId — id de rostro (FaceMatcher-like, umbral 0.6)
 * @param {{ label: string; confidence: number }} emotion
 * @param {number} [capturedAt] — ms epoch
 */
export function buildCaptureMetadata(faceId, emotion, capturedAt = Date.now()) {
  const nivelConfianza = Math.max(
    1,
    Math.min(100, Math.round(Number(emotion.confidence) || 1)),
  );
  return {
    nombreArchivo: buildEmotionCaptureFilename(faceId, {
      ...emotion,
      confidence: nivelConfianza,
    }),
    emocion: emotion.label,
    fechaCaptura: new Date(capturedAt).toISOString(),
    estadoProcesamiento: "nuevo",
    nivelConfianza,
    user: sanitizeFilenamePart(faceId, "face"),
    faceMatchThreshold: FACE_MATCH_THRESHOLD,
  };
}

/**
 * Recorta la región facial (vista espejo como en pantalla).
 * @param {HTMLVideoElement} video
 * @param {{ x: number; y: number; width: number; height: number }} box
 */
export function captureFaceRegionBlob(video, box, { padding = 0.2 } = {}) {
  return new Promise((resolve) => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh || !box) {
      resolve(null);
      return;
    }

    const padX = box.width * padding;
    const padY = box.height * padding;
    const x = Math.max(0, box.x - padX);
    const y = Math.max(0, box.y - padY);
    const w = Math.min(vw - x, box.width + padX * 2);
    const h = Math.min(vh - y, box.height + padY * 2);
    if (w < 8 || h < 8) {
      resolve(null);
      return;
    }

    const mirrorX = vw - x - w;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(null);
      return;
    }

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, mirrorX, y, w, h, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => resolve(blob), "image/png", 0.92);
  });
}

/**
 * Envía foto + metadatos al backend (POST multipart /api/captures).
 */
export async function sendEmotionCaptureToBackend({
  video,
  box,
  faceId,
  emotion,
  capturedAt,
}) {
  const blob = await captureFaceRegionBlob(video, box);
  if (!blob) return { ok: false, error: "empty-capture" };

  const metadata = buildCaptureMetadata(faceId, emotion, capturedAt);
  const form = new FormData();
  form.append("metadata", JSON.stringify(metadata));
  form.append("photo", blob, metadata.nombreArchivo);

  const res = await fetch(getEmotionCapturesEndpoint(), {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const error = text || res.statusText;
    console.warn(
      `[emotion-capture] POST ${getEmotionCapturesEndpoint()} → ${res.status}`,
      error,
    );
    return { ok: false, error, status: res.status };
  }

  const data = await res.json().catch(() => ({}));
  return {
    ok: true,
    skipped: Boolean(data.skipped),
    metadata,
    response: data,
  };
}

import { useEffect } from "react";

/** Pausa decodificación de vídeo mientras hay modal (menos GPU al cerrar). */
export function usePauseCameraPreview(videoRef, paused, status) {
  useEffect(() => {
    if (status !== "ready") return undefined;
    const el = videoRef?.current;
    if (!el) return undefined;

    const stream = el.srcObject;
    if (stream instanceof MediaStream) {
      for (const track of stream.getVideoTracks()) {
        track.enabled = !paused;
      }
    }

    if (paused) el.pause();
    else void el.play().catch(() => {});

    return undefined;
  }, [paused, status, videoRef]);
}

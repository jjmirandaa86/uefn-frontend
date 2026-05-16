import { useEffect, useRef, useState } from "react";
import { appendEmotionHistoryRecord } from "../utils/emotionHistoryStore.js";

/** Nombre del evento global al guardar un tick (1/s) de emoción. `detail`: `{ entry, sessionStartedAt }`. */
export const EMOTION_HISTORY_STORED_EVENT = "emotion-history-stored";

const MAX_SNAPSHOTS = 7200;

function formatClockHm() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Cada segundo con cámara `ready` guarda `{ time, label, emoji, color, seq }`
 * y dispara `EMOTION_HISTORY_STORED_EVENT` en `window`. Respeta pausa (`sessionTimer.pauseBeganAt`).
 * Persiste cada tick en localStorage (misma forma que `public/data/emotionHistory.json`).
 */
export function useEmotionHistoryRecorder({
  status,
  cameraSessionStartedAt,
  liveEmotion,
  sessionTimer,
}) {
  const [emotionSessionHistory, setEmotionSessionHistory] = useState([]);
  const liveRef = useRef(liveEmotion);
  const sessionTimerRef = useRef(sessionTimer);
  const seqRef = useRef(0);

  useEffect(() => {
    liveRef.current = liveEmotion;
    sessionTimerRef.current = sessionTimer;
  }, [liveEmotion, sessionTimer]);

  useEffect(() => {
    if (status !== "ready" || cameraSessionStartedAt == null) {
      seqRef.current = 0;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- vaciar histórico al cortar cámara
      setEmotionSessionHistory([]);
      return;
    }

    seqRef.current = 0;
    setEmotionSessionHistory([]);

    const tick = () => {
      if (sessionTimerRef.current.pauseBeganAt != null) return;

      const e = liveRef.current;
      const seq = seqRef.current;
      seqRef.current += 1;
      const entry = {
        seq,
        time: formatClockHm(),
        label: e.label,
        emoji: e.emoji,
        color: e.color,
      };

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(EMOTION_HISTORY_STORED_EVENT, {
            detail: { entry, sessionStartedAt: cameraSessionStartedAt },
          }),
        );
        appendEmotionHistoryRecord(cameraSessionStartedAt, entry);
      }

      setEmotionSessionHistory((prev) =>
        [entry, ...prev].slice(0, MAX_SNAPSHOTS),
      );
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [status, cameraSessionStartedAt]);

  return emotionSessionHistory;
}

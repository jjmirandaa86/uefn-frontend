import { useEffect, useRef } from "react";
import { postEmotionHistoryEntry } from "../services/emotionHistoryApi.js";

/** Dispara al guardar un tick en el backend. */
export const EMOTION_HISTORY_STORED_EVENT = "emotion-history-stored";

function isStableFaceUser(faceUser) {
  return (
    typeof faceUser === "string" &&
    faceUser.length > 0 &&
    !faceUser.startsWith("face-pending") &&
    faceUser !== "face-unknown"
  );
}

/**
 * Cada segundo con cámara `ready` envía emoción a `emotion_recent_history` (MySQL).
 * Respeta pausa (`sessionTimer.pauseBeganAt`).
 */
export function useEmotionHistoryRecorder({
  status,
  cameraSessionStartedAt,
  liveEmotion,
  sessionTimer,
  currentFaceUser,
}) {
  const liveRef = useRef(liveEmotion);
  const sessionTimerRef = useRef(sessionTimer);
  const faceUserRef = useRef(currentFaceUser);

  useEffect(() => {
    liveRef.current = liveEmotion;
    sessionTimerRef.current = sessionTimer;
    faceUserRef.current = currentFaceUser;
  }, [liveEmotion, sessionTimer, currentFaceUser]);

  useEffect(() => {
    if (status !== "ready" || cameraSessionStartedAt == null) {
      return undefined;
    }

    const tick = async () => {
      if (sessionTimerRef.current.pauseBeganAt != null) return;

      const e = liveRef.current;
      const faceUser = faceUserRef.current;
      if (!isStableFaceUser(faceUser) || e.confidence <= 0) return;

      try {
        await postEmotionHistoryEntry({
          emocion: e.label,
          nivelConfianza: e.confidence,
          faceUser,
        });
        window.dispatchEvent(new CustomEvent(EMOTION_HISTORY_STORED_EVENT));
      } catch (err) {
        console.warn("[emotion-history]", err);
      }
    };

    void tick();
    const id = window.setInterval(() => {
      void tick();
    }, 1000);
    return () => window.clearInterval(id);
  }, [status, cameraSessionStartedAt]);
}

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  APPROXIMATE_PROFILE_IDLE,
  EMOTION_ROWS_IDLE,
  NEUTRAL_FALLBACK,
} from "../dashboard/liveEmotionDefaults.js";
import {
  SESSION_TIMER_INITIAL,
  sessionTimerReducer,
} from "../dashboard/sessionTimerReducer.js";
import { useEmotionHistoryRecorder } from "../hooks/useEmotionHistoryRecorder.js";
import { formatSecondsAsClock } from "../utils/formatDetectedDuration.js";

// eslint-disable-next-line react-refresh/only-export-components -- context + provider acoplados al dashboard
export const DashboardLiveSessionContext = createContext(null);

/**
 * Estado de cámara/emoción vive aquí (no en App) para que los modales
 * no se re-rendericen en cada frame de face-api.
 */
export function DashboardLiveSessionProvider({
  children,
  status,
  cameraSessionStartedAt,
  recordingPaused = false,
}) {
  const [liveEmotion, setLiveEmotion] = useState(NEUTRAL_FALLBACK);
  const [emotionRows, setEmotionRows] = useState(EMOTION_ROWS_IDLE);
  const [approximateProfile, setApproximateProfile] = useState(
    APPROXIMATE_PROFILE_IDLE,
  );
  const [sessionTimer, dispatchSessionTimer] = useReducer(
    sessionTimerReducer,
    SESSION_TIMER_INITIAL,
  );
  const [detectedSessionSeconds, setDetectedSessionSeconds] = useState(0);
  const [currentFaceUser, setCurrentFaceUser] = useState(null);

  const pauseSessionTimer = useCallback(() => {
    dispatchSessionTimer({ type: "pause" });
  }, []);

  const resumeSessionTimer = useCallback(() => {
    dispatchSessionTimer({ type: "resume" });
  }, []);

  useEffect(() => {
    if (status !== "ready") {
      dispatchSessionTimer({ type: "reset" });
    }
  }, [status]);

  useEffect(() => {
    if (status !== "ready" || cameraSessionStartedAt == null) {
      setDetectedSessionSeconds(0);
      return;
    }
    const { pauseMs, pauseBeganAt } = sessionTimer;
    const tick = () => {
      const ms =
        pauseBeganAt != null
          ? pauseBeganAt - cameraSessionStartedAt - pauseMs
          : Date.now() - cameraSessionStartedAt - pauseMs;
      setDetectedSessionSeconds(Math.max(0, Math.floor(ms / 1000)));
    };
    tick();
    if (pauseBeganAt != null) return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [status, cameraSessionStartedAt, sessionTimer]);

  useEffect(() => {
    if (status !== "ready") setCurrentFaceUser(null);
  }, [status]);

  const sessionLiveEmotion =
    status === "ready" ? liveEmotion : NEUTRAL_FALLBACK;
  const sessionEmotionRows =
    status === "ready" ? emotionRows : EMOTION_ROWS_IDLE;

  const detectedSessionDuration = useMemo(
    () => formatSecondsAsClock(detectedSessionSeconds),
    [detectedSessionSeconds],
  );

  useEmotionHistoryRecorder({
    status,
    cameraSessionStartedAt,
    liveEmotion: sessionLiveEmotion,
    sessionTimer,
    currentFaceUser,
    paused: recordingPaused,
  });

  const value = useMemo(
    () => ({
      liveEmotion: sessionLiveEmotion,
      setLiveEmotion,
      emotionRows: sessionEmotionRows,
      setEmotionRows,
      approximateProfile,
      setApproximateProfile,
      cameraSessionStartedAt,
      detectedSessionSeconds,
      detectedSessionDuration,
      pauseSessionTimer,
      resumeSessionTimer,
      currentFaceUser,
      setCurrentFaceUser,
    }),
    [
      sessionLiveEmotion,
      sessionEmotionRows,
      approximateProfile,
      cameraSessionStartedAt,
      detectedSessionSeconds,
      detectedSessionDuration,
      pauseSessionTimer,
      resumeSessionTimer,
      currentFaceUser,
    ],
  );

  return (
    <DashboardLiveSessionContext.Provider value={value}>
      {children}
    </DashboardLiveSessionContext.Provider>
  );
}

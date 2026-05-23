import { createContext, useMemo } from "react";

// eslint-disable-next-line react-refresh/only-export-components -- context + provider acoplados al dashboard
export const DashboardLiveSessionContext = createContext(null);

export function DashboardLiveSessionProvider({
  children,
  liveEmotion,
  setLiveEmotion,
  emotionRows,
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
}) {
  const value = useMemo(
    () => ({
      liveEmotion,
      setLiveEmotion,
      emotionRows,
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
      liveEmotion,
      setLiveEmotion,
      emotionRows,
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
    ],
  );

  return (
    <DashboardLiveSessionContext.Provider value={value}>
      {children}
    </DashboardLiveSessionContext.Provider>
  );
}

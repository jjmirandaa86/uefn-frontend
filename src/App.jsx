import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DashboardLiveSessionProvider } from "./context/DashboardLiveSessionContext.jsx";
import {
  APPROXIMATE_PROFILE_IDLE,
  EMOTION_ROWS_IDLE,
  NEUTRAL_FALLBACK,
} from "./dashboard/liveEmotionDefaults.js";
import { getProfileAvatarById } from "./data/profileAvatars.js";
import { DashboardCameraStage } from "./components/dashboard/DashboardCameraStage.jsx";
import { DashboardLeftColumn } from "./components/dashboard/DashboardLeftColumn.jsx";
import { DashboardModals } from "./components/dashboard/modals/DashboardModals.jsx";
import { DashboardRightColumn } from "./components/dashboard/DashboardRightColumn.jsx";
import { GameScreen } from "./components/game/GameScreen.jsx";
import { ShellFooterCredits } from "./components/footer/ShellFooterCredits.jsx";
import { DashboardHeaderBar } from "./components/head/DashboardHeaderBar.jsx";
import { SidebarMenu } from "./components/menu/SidebarMenu.jsx";
import { useCamera } from "./hooks/useCamera";
import { useClock } from "./hooks/useClock";
import { useEmotionHistoryRecorder } from "./hooks/useEmotionHistoryRecorder.js";
import { formatSecondsAsClock } from "./utils/formatDetectedDuration.js";
import { seedEmotionHistoryFromPublicJson } from "./utils/emotionHistoryStore.js";

const SESSION_TIMER_INITIAL = { pauseMs: 0, pauseBeganAt: null };

/** Pausas del contador "Tiempo detectado" (ms en pausa ya cerradas + inicio de la pausa actual). */
function sessionTimerReducer(state, action) {
  switch (action.type) {
    case "reset":
      return SESSION_TIMER_INITIAL;
    case "pause":
      if (state.pauseBeganAt != null) return state;
      return { ...state, pauseBeganAt: Date.now() };
    case "resume": {
      const began = state.pauseBeganAt;
      if (began == null) return state;
      return {
        pauseMs: state.pauseMs + (Date.now() - began),
        pauseBeganAt: null,
      };
    }
    default:
      return state;
  }
}

function App() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const [
    desktopNavbarExpanded,
    { toggle: toggleDesktopNavbar, close: closeDesktopNavbar },
  ] = useDisclosure(false);
  const [statsModalOpened, { open: openStatsModal, close: closeStatsModal }] =
    useDisclosure(false);
  const [todayModalOpened, { open: openTodayModal, close: closeTodayModal }] =
    useDisclosure(false);
  const [
    historyModalOpened,
    { open: openHistoryModal, close: closeHistoryModal },
  ] = useDisclosure(false);
  const [
    settingsModalOpened,
    { open: openSettingsModal, close: closeSettingsModal },
  ] = useDisclosure(false);
  const [
    profileModalOpened,
    { open: openProfileModal, close: closeProfileModal },
  ] = useDisclosure(false);
  const [profileEditorKey, setProfileEditorKey] = useState(0);
  const [userDisplayName, setUserDisplayName] = useState("Jefferson");
  const [userAvatarId, setUserAvatarId] = useState("avatar-001");
  const [activeNav, setActiveNav] = useState("inicio");
  const { time, date } = useClock();
  const { videoRef, status, startCamera, stopCamera, cameraSessionStartedAt } =
    useCamera();
  const headerAvatar = getProfileAvatarById(userAvatarId);

  const [liveEmotion, setLiveEmotion] = useState(NEUTRAL_FALLBACK);
  const [emotionRows, setEmotionRows] = useState(EMOTION_ROWS_IDLE);
  const [approximateProfile, setApproximateProfile] = useState(
    APPROXIMATE_PROFILE_IDLE,
  );
  const [sessionTimer, dispatchSessionTimer] = useReducer(
    sessionTimerReducer,
    SESSION_TIMER_INITIAL,
  );
  /** Segundos de sesión mostrados (congelados en pausa; avanzan al reanudar). */
  const [detectedSessionSeconds, setDetectedSessionSeconds] = useState(0);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- al cortar cámara el contador vuelve a 0
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
    if (pauseBeganAt != null) {
      return;
    }
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [status, cameraSessionStartedAt, sessionTimer]);

  const detectedSessionDuration = useMemo(
    () => formatSecondsAsClock(detectedSessionSeconds),
    [detectedSessionSeconds],
  );

  const emotionSessionHistory = useEmotionHistoryRecorder({
    status,
    cameraSessionStartedAt,
    liveEmotion,
    sessionTimer,
  });

  useEffect(() => {
    void seedEmotionHistoryFromPublicJson();
  }, []);

  const sessionLiveEmotion =
    status === "ready" ? liveEmotion : NEUTRAL_FALLBACK;
  const sessionEmotionRows =
    status === "ready" ? emotionRows : EMOTION_ROWS_IDLE;

  const handleProfileModalClose = () => {
    closeProfileModal();
    setActiveNav((prev) => (prev === "perfil" ? "inicio" : prev));
  };

  const handleNavClick = (id) => {
    if (id === "inicio") {
      closeMobile();
      closeDesktopNavbar();
      closeStatsModal();
      closeTodayModal();
      closeHistoryModal();
      closeSettingsModal();
      closeProfileModal();
      setActiveNav("inicio");
      return;
    }
    if (id === "estadisticas") {
      if (mobileOpened) closeMobile();
      closeTodayModal();
      closeHistoryModal();
      closeSettingsModal();
      closeProfileModal();
      openStatsModal();
      setActiveNav("estadisticas");
      return;
    }
    if (id === "emociones-hoy") {
      if (mobileOpened) closeMobile();
      closeStatsModal();
      closeHistoryModal();
      closeSettingsModal();
      closeProfileModal();
      openTodayModal();
      setActiveNav("emociones-hoy");
      return;
    }
    if (id === "historial") {
      if (mobileOpened) closeMobile();
      closeStatsModal();
      closeTodayModal();
      closeSettingsModal();
      closeProfileModal();
      openHistoryModal();
      setActiveNav("historial");
      return;
    }
    if (id === "perfil") {
      if (mobileOpened) closeMobile();
      closeStatsModal();
      closeTodayModal();
      closeHistoryModal();
      closeSettingsModal();
      setProfileEditorKey((k) => k + 1);
      openProfileModal();
      setActiveNav("perfil");
      return;
    }
    if (id === "game") {
      closeMobile();
      closeDesktopNavbar();
      closeStatsModal();
      closeTodayModal();
      closeHistoryModal();
      closeSettingsModal();
      closeProfileModal();
      setActiveNav("game");
      return;
    }
    setActiveNav(id);
  };

  const handleStatsModalClose = () => {
    closeStatsModal();
    setActiveNav((prev) => (prev === "estadisticas" ? "inicio" : prev));
  };

  const handleTodayModalClose = () => {
    closeTodayModal();
    setActiveNav((prev) => (prev === "emociones-hoy" ? "inicio" : prev));
  };

  const handleHistoryModalClose = () => {
    closeHistoryModal();
    setActiveNav((prev) => (prev === "historial" ? "inicio" : prev));
  };

  const openSettings = () => {
    closeStatsModal();
    closeTodayModal();
    closeHistoryModal();
    closeProfileModal();
    openSettingsModal();
  };

  const openEmotionsTodayFromDashboard = () => {
    if (mobileOpened) closeMobile();
    closeStatsModal();
    closeHistoryModal();
    closeSettingsModal();
    closeProfileModal();
    openTodayModal();
    setActiveNav("emociones-hoy");
  };

  return (
    <AppShell
      mode="static"
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopNavbarExpanded },
      }}
      footer={{ height: 84 }}
      padding="md"
      className="app-shell-root"
    >
      <AppShell.Header className="shell-header">
        <DashboardHeaderBar
          mobileOpened={mobileOpened}
          onToggleMobile={toggleMobile}
          desktopNavbarExpanded={desktopNavbarExpanded}
          onToggleDesktopNavbar={toggleDesktopNavbar}
          time={time}
          date={date}
          avatarImageSrc={headerAvatar.imageSrc}
          userDisplayName={userDisplayName}
          onOpenSettings={openSettings}
        />
      </AppShell.Header>

      <AppShell.Navbar p="md" className="shell-navbar">
        <SidebarMenu activeNav={activeNav} onItemClick={handleNavClick} />
      </AppShell.Navbar>

      <DashboardLiveSessionProvider
        liveEmotion={sessionLiveEmotion}
        setLiveEmotion={setLiveEmotion}
        emotionRows={sessionEmotionRows}
        setEmotionRows={setEmotionRows}
        approximateProfile={approximateProfile}
        setApproximateProfile={setApproximateProfile}
        cameraSessionStartedAt={cameraSessionStartedAt}
        detectedSessionSeconds={detectedSessionSeconds}
        detectedSessionDuration={detectedSessionDuration}
        pauseSessionTimer={pauseSessionTimer}
        resumeSessionTimer={resumeSessionTimer}
        emotionSessionHistory={emotionSessionHistory}
      >
        <DashboardModals
          statsModalOpened={statsModalOpened}
          onStatsModalClose={handleStatsModalClose}
          todayModalOpened={todayModalOpened}
          onTodayModalClose={handleTodayModalClose}
          historyModalOpened={historyModalOpened}
          onHistoryModalClose={handleHistoryModalClose}
          settingsModalOpened={settingsModalOpened}
          onSettingsModalClose={closeSettingsModal}
          profileModalOpened={profileModalOpened}
          onProfileModalClose={handleProfileModalClose}
          profileEditorKey={profileEditorKey}
          userDisplayName={userDisplayName}
          userAvatarId={userAvatarId}
          onProfileSave={(next) => {
            setUserDisplayName(next.name);
            setUserAvatarId(next.avatarId);
            handleProfileModalClose();
          }}
        />

        <AppShell.Main className="app-main-content">
          {activeNav === "game" ? (
            <GameScreen />
          ) : (
            <section className="dashboard-grid">
              <DashboardLeftColumn />

              <DashboardCameraStage
                videoRef={videoRef}
                status={status}
                startCamera={startCamera}
                stopCamera={stopCamera}
              />

              <DashboardRightColumn
                onOpenEmotionsToday={openEmotionsTodayFromDashboard}
              />
            </section>
          )}
        </AppShell.Main>
      </DashboardLiveSessionProvider>

      <AppShell.Footer className="shell-footer">
        <ShellFooterCredits />
      </AppShell.Footer>
    </AppShell>
  );
}

export default App;

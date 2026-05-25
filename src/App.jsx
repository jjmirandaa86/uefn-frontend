import { useEffect, useState } from "react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DashboardLiveSessionProvider } from "./context/DashboardLiveSessionContext.jsx";
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
import { prefetchRecentEmotionHistory } from "./utils/recentHistoryCache.js";

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
  const [holdPipelineAfterHistory, setHoldPipelineAfterHistory] =
    useState(false);
  const [
    funMomentsModalOpened,
    { open: openFunMomentsModal, close: closeFunMomentsModal },
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
  const { videoRef, status, startCamera, stopCamera, cameraSessionStartedAt } =
    useCamera();
  const headerAvatar = getProfileAvatarById(userAvatarId);

  useEffect(() => {
    void prefetchRecentEmotionHistory();
  }, []);

  const dashboardModalOpen =
    statsModalOpened ||
    historyModalOpened ||
    todayModalOpened ||
    funMomentsModalOpened ||
    settingsModalOpened ||
    profileModalOpened;

  /** Menú/modal: pausar detección (ref, sin reiniciar effect) y vídeo solo en modales. */
  const dashboardUiBlocked =
    dashboardModalOpen || mobileOpened || desktopNavbarExpanded;

  const pipelinePaused =
    dashboardUiBlocked || holdPipelineAfterHistory;

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
      closeFunMomentsModal();
      closeSettingsModal();
      closeProfileModal();
      setActiveNav("inicio");
      return;
    }
    if (id === "estadisticas") {
      if (mobileOpened) closeMobile();
      closeTodayModal();
      closeHistoryModal();
      closeFunMomentsModal();
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
      closeFunMomentsModal();
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
      closeFunMomentsModal();
      closeSettingsModal();
      closeProfileModal();
      openHistoryModal();
      setActiveNav("historial");
      return;
    }
    if (id === "momentos-divertidos") {
      if (mobileOpened) closeMobile();
      closeStatsModal();
      closeTodayModal();
      closeHistoryModal();
      closeSettingsModal();
      closeProfileModal();
      openFunMomentsModal();
      setActiveNav("momentos-divertidos");
      return;
    }
    if (id === "perfil") {
      if (mobileOpened) closeMobile();
      closeStatsModal();
      closeTodayModal();
      closeHistoryModal();
      closeFunMomentsModal();
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
      closeFunMomentsModal();
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
    setHoldPipelineAfterHistory(true);
    window.setTimeout(() => setHoldPipelineAfterHistory(false), 400);
  };

  const handleFunMomentsModalClose = () => {
    closeFunMomentsModal();
    setActiveNav((prev) => (prev === "momentos-divertidos" ? "inicio" : prev));
  };

  const openSettings = () => {
    closeStatsModal();
    closeTodayModal();
    closeHistoryModal();
    closeFunMomentsModal();
    closeProfileModal();
    openSettingsModal();
  };

  const openEmotionsTodayFromDashboard = () => {
    if (mobileOpened) closeMobile();
    closeStatsModal();
    closeHistoryModal();
    closeFunMomentsModal();
    closeSettingsModal();
    closeProfileModal();
    openTodayModal();
    setActiveNav("emociones-hoy");
  };

  return (
    <AppShell
      mode="static"
      transitionDuration={0}
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
          avatarImageSrc={headerAvatar.imageSrc}
          userDisplayName={userDisplayName}
          onOpenSettings={openSettings}
        />
      </AppShell.Header>

      <AppShell.Navbar p="md" className="shell-navbar">
        <SidebarMenu activeNav={activeNav} onItemClick={handleNavClick} />
      </AppShell.Navbar>

      <DashboardModals
        statsModalOpened={statsModalOpened}
        onStatsModalClose={handleStatsModalClose}
        todayModalOpened={todayModalOpened}
        onTodayModalClose={handleTodayModalClose}
        historyModalOpened={historyModalOpened}
        onHistoryModalClose={handleHistoryModalClose}
        funMomentsModalOpened={funMomentsModalOpened}
        onFunMomentsModalClose={handleFunMomentsModalClose}
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

      <DashboardLiveSessionProvider
        status={status}
        cameraSessionStartedAt={cameraSessionStartedAt}
        recordingPaused={dashboardModalOpen}
      >
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
                detectionPaused={pipelinePaused}
                previewPaused={dashboardModalOpen || holdPipelineAfterHistory}
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

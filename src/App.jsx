import { useState } from "react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { emotions } from "./data/emotions";
import { getProfileAvatarById } from "./data/profileAvatars.js";
import { DashboardCameraStage } from "./components/dashboard/DashboardCameraStage.jsx";
import { DashboardLeftColumn } from "./components/dashboard/DashboardLeftColumn.jsx";
import { DashboardModals } from "./components/dashboard/modals/DashboardModals.jsx";
import { DashboardRightColumn } from "./components/dashboard/DashboardRightColumn.jsx";
import { ShellFooterCredits } from "./components/footer/ShellFooterCredits.jsx";
import { DashboardHeaderBar } from "./components/head/DashboardHeaderBar.jsx";
import { SidebarMenu } from "./components/menu/SidebarMenu.jsx";
import { useCamera } from "./hooks/useCamera";
import { useClock } from "./hooks/useClock";

const currentEmotion = emotions[0];

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
  const { videoRef, status, startCamera, stopCamera } = useCamera();
  const headerAvatar = getProfileAvatarById(userAvatarId);

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
        <section className="dashboard-grid">
          <DashboardLeftColumn emotion={currentEmotion} />

          <DashboardCameraStage
            videoRef={videoRef}
            status={status}
            startCamera={startCamera}
            stopCamera={stopCamera}
          />

          <DashboardRightColumn onOpenEmotionsToday={openEmotionsTodayFromDashboard} />
        </section>
      </AppShell.Main>

      <AppShell.Footer className="shell-footer">
        <ShellFooterCredits />
      </AppShell.Footer>
    </AppShell>
  );
}

export default App;

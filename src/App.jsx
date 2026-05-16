import { useState } from "react";
import {
  AppShell,
  Group,
  Progress,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlayerPause,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import { emotions } from "./data/emotions";
import { getProfileAvatarById } from "./data/profileAvatars.js";
import { AvatarAgeGenderRow } from "./components/AvatarAgeGenderRow.jsx";
import { DashboardCameraStage } from "./components/dashboard/DashboardCameraStage.jsx";
import { DashboardRightColumn } from "./components/dashboard/DashboardRightColumn.jsx";
import { EmotionsTodayBody } from "./components/dashboard/EmotionsTodayBody.jsx";
import { ProfileEditor } from "./components/dashboard/ProfileEditor.jsx";
import { QuickStatsBody } from "./components/dashboard/QuickStatsBody.jsx";
import { RecentHistoryBody } from "./components/dashboard/RecentHistoryBody.jsx";
import { SettingsAboutBody } from "./components/dashboard/SettingsAboutBody.jsx";
import { ShellFooterCredits } from "./components/footer/ShellFooterCredits.jsx";
import { DashboardHeaderBar } from "./components/head/DashboardHeaderBar.jsx";
import { AppModal } from "./components/layout/AppModal.jsx";
import { SidebarMenu } from "./components/menu/SidebarMenu.jsx";
import { useCamera } from "./hooks/useCamera";
import { useClock } from "./hooks/useClock";

const currentEmotion = emotions[0];

function GlassCard({ children, className = "" }) {
  return <section className={`glass-card ${className}`}>{children}</section>;
}

function App() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const [
    desktopNavbarExpanded,
    { toggle: toggleDesktopNavbar, close: closeDesktopNavbar },
  ] = useDisclosure(true);
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

      <AppModal
        opened={statsModalOpened}
        onClose={handleStatsModalClose}
        title="Estadisticas rapidas"
        size="lg"
      >
        <QuickStatsBody />
      </AppModal>

      <AppModal
        opened={todayModalOpened}
        onClose={handleTodayModalClose}
        title="Emociones de hoy"
        size="lg"
      >
        <EmotionsTodayBody />
      </AppModal>

      <AppModal
        opened={historyModalOpened}
        onClose={handleHistoryModalClose}
        title="Historial reciente"
        size="xl"
      >
        <RecentHistoryBody />
      </AppModal>

      <AppModal
        opened={settingsModalOpened}
        onClose={closeSettingsModal}
        title="Configuracion"
        size="md"
      >
        <SettingsAboutBody />
      </AppModal>

      <AppModal
        opened={profileModalOpened}
        onClose={handleProfileModalClose}
        title="Perfil"
        size="md"
      >
        <ProfileEditor
          key={profileEditorKey}
          initialName={userDisplayName}
          initialAvatarId={userAvatarId}
          onSave={(next) => {
            setUserDisplayName(next.name);
            setUserAvatarId(next.avatarId);
            handleProfileModalClose();
          }}
        />
      </AppModal>

      <AppShell.Main className="app-main-content">
        <section className="dashboard-grid">
          <aside className="left-column">
            <GlassCard>
              <Text size="xs" fw={800} tt="uppercase">
                Emocion actual
              </Text>
              <Group mt="md" align="center">
                <div className="emotion-orb">{currentEmotion.emoji}</div>
                <Stack gap={0}>
                  <Text c="green.4" fw={800} size="xl">
                    {currentEmotion.label}
                  </Text>
                  <Text c="green.3" fw={800} size="xl">
                    {currentEmotion.confidence}%
                  </Text>
                </Stack>
              </Group>
              <Text mt="lg" size="xs" c="dimmed">
                Tiempo detectado
              </Text>
              <Text fw={700}>00:00:15</Text>
              <div className="divider emotion-info-divider" />
              <br></br>
              <Text size="xs" fw={800} tt="uppercase">
                Informacion Aproximada
              </Text>
              <Group mt="md" justify="space-between">
                <AvatarAgeGenderRow icon={IconUser} />
              </Group>{" "}
              <div className="divider emotion-info-divider" />
              <div>
                <Group justify="space-between">
                  <Text size="sm">Confianza</Text>
                  <Text size="sm">92%</Text>
                </Group>
                <Progress value={92} color="violet" mt={8} />
              </div>
            </GlassCard>

            <GlassCard>
              <Text size="xs" fw={800} tt="uppercase">
                Acciones rapidas
              </Text>
              <Stack mt="lg" gap="lg">
                <Group justify="space-between">
                  <Text size="sm">Puntos faciales</Text>
                  <Switch defaultChecked color="green" />
                  <Action
                    label="Pausar deteccion"
                    icon={<IconPlayerPause size={18} />}
                  />
                  <Action
                    label="Modo privado"
                    icon={<IconShieldCheck size={18} />}
                  />
                </Group>
              </Stack>
            </GlassCard>
          </aside>

          <DashboardCameraStage
            videoRef={videoRef}
            status={status}
            startCamera={startCamera}
            stopCamera={stopCamera}
          />

          <DashboardRightColumn />
        </section>
      </AppShell.Main>

      <AppShell.Footer className="shell-footer">
        <ShellFooterCredits />
      </AppShell.Footer>
    </AppShell>
  );
}

function Action({ label, icon }) {
  return (
    <button className="action-button" type="button">
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default App;

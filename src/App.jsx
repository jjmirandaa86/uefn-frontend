import { useState } from 'react';
import {
  ActionIcon,
  Anchor,
  AppShell,
  Avatar,
  Badge,
  Burger,
  Button,
  Checkbox,
  Group,
  Modal,
  NavLink,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBrandOpenai,
  IconCalendarEvent,
  IconChartDots,
  IconClock,
  IconDownload,
  IconHome,
  IconPlayerPause,
  IconSettings,
  IconShieldCheck,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { emotions, emotionTrend, recentHistory } from './data/emotions';
import { getProfileAvatarById, PROFILE_AVATARS } from './data/profileAvatars.js';
import {
  API_URL,
  APP_DESCRIPTION,
  APP_VERSION,
  DEFAULT_RECOGNITION_TIME,
} from './appMeta.js';
import { useCamera } from './hooks/useCamera';
import { useClock } from './hooks/useClock';

const currentEmotion = emotions[0];

const navItems = [
  { id: 'inicio', icon: IconHome, label: 'Inicio' },
  { id: 'historial', icon: IconClock, label: 'Historial' },
  { id: 'estadisticas', icon: IconChartDots, label: 'Estadisticas' },
  { id: 'emociones-hoy', icon: IconCalendarEvent, label: 'Emociones de hoy' },
  { id: 'perfil', icon: IconUser, label: 'Perfil' },
];

function GlassCard({ children, className = '' }) {
  return <section className={`glass-card ${className}`}>{children}</section>;
}

function App() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopNavbarExpanded, { toggle: toggleDesktopNavbar, close: closeDesktopNavbar }] =
    useDisclosure(true);
  const [statsModalOpened, { open: openStatsModal, close: closeStatsModal }] = useDisclosure(false);
  const [todayModalOpened, { open: openTodayModal, close: closeTodayModal }] = useDisclosure(false);
  const [historyModalOpened, { open: openHistoryModal, close: closeHistoryModal }] = useDisclosure(false);
  const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
  const [profileModalOpened, { open: openProfileModal, close: closeProfileModal }] = useDisclosure(false);
  const [profileEditorKey, setProfileEditorKey] = useState(0);
  const [userDisplayName, setUserDisplayName] = useState('Jefferson');
  const [userAvatarId, setUserAvatarId] = useState('violet-cyan');
  const [activeNav, setActiveNav] = useState('inicio');
  const { time, date } = useClock();
  const { videoRef, status, startCamera } = useCamera();
  const headerAvatar = getProfileAvatarById(userAvatarId);
  const HeaderAvatarIcon = headerAvatar.Icon;

  const handleProfileModalClose = () => {
    closeProfileModal();
    setActiveNav((prev) => (prev === 'perfil' ? 'inicio' : prev));
  };

  const handleNavClick = (id) => {
    if (id === 'inicio') {
      closeMobile();
      closeDesktopNavbar();
      closeStatsModal();
      closeTodayModal();
      closeHistoryModal();
      closeSettingsModal();
      closeProfileModal();
      setActiveNav('inicio');
      return;
    }
    if (id === 'estadisticas') {
      if (mobileOpened) closeMobile();
      closeTodayModal();
      closeHistoryModal();
      closeSettingsModal();
      closeProfileModal();
      openStatsModal();
      setActiveNav('estadisticas');
      return;
    }
    if (id === 'emociones-hoy') {
      if (mobileOpened) closeMobile();
      closeStatsModal();
      closeHistoryModal();
      closeSettingsModal();
      closeProfileModal();
      openTodayModal();
      setActiveNav('emociones-hoy');
      return;
    }
    if (id === 'historial') {
      if (mobileOpened) closeMobile();
      closeStatsModal();
      closeTodayModal();
      closeSettingsModal();
      closeProfileModal();
      openHistoryModal();
      setActiveNav('historial');
      return;
    }
    if (id === 'perfil') {
      if (mobileOpened) closeMobile();
      closeStatsModal();
      closeTodayModal();
      closeHistoryModal();
      closeSettingsModal();
      setProfileEditorKey((k) => k + 1);
      openProfileModal();
      setActiveNav('perfil');
      return;
    }
    setActiveNav(id);
  };

  const handleStatsModalClose = () => {
    closeStatsModal();
    setActiveNav((prev) => (prev === 'estadisticas' ? 'inicio' : prev));
  };

  const handleTodayModalClose = () => {
    closeTodayModal();
    setActiveNav((prev) => (prev === 'emociones-hoy' ? 'inicio' : prev));
  };

  const handleHistoryModalClose = () => {
    closeHistoryModal();
    setActiveNav((prev) => (prev === 'historial' ? 'inicio' : prev));
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
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopNavbarExpanded },
      }}
      footer={{ height: 84 }}
      padding="md"
      className="app-shell-root"
    >
      <AppShell.Header className="shell-header">
        <Group h="100%" px="sm" justify="space-between" wrap="nowrap" gap="xs">
          <Group gap={6} wrap="nowrap">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger
              opened={desktopNavbarExpanded}
              onClick={toggleDesktopNavbar}
              visibleFrom="sm"
              size="sm"
            />
            <IconBrandOpenai className="brand-icon brand-icon--compact" size={22} stroke={1.25} />
            <Text fw={800} size="sm" visibleFrom="xs" lineClamp={1}>
              MoodVision AI
            </Text>
          </Group>

          <Stack gap={0} align="center" visibleFrom="sm" style={{ flex: 1 }} miw={0}>
            <Text fw={700} size="sm" lh={1.2}>
              {time}
            </Text>
            <Text size="xs" c="dimmed" tt="capitalize" lh={1.2} lineClamp={1}>
              {date}
            </Text>
          </Stack>

          <Group gap={6} wrap="nowrap" align="center">
            <Group gap={6} wrap="nowrap" align="center" className="header-recognition">
              <Avatar
                className="header-recognition-avatar"
                size={32}
                radius="lg"
                variant="gradient"
                gradient={headerAvatar.gradient}
                aria-hidden
              >
                <HeaderAvatarIcon size={18} stroke={1.5} />
              </Avatar>
              <Stack gap={1} justify="center" miw={0}>
                <Text className="header-recognition__label" c="dimmed" lh={1.1} component="span">
                  Reconocido como:
                </Text>
                <Text className="header-recognition__name" fw={800} c="green.4" lh={1.1} component="span">
                  {userDisplayName}
                </Text>
              </Stack>
            </Group>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label="Configuracion"
              onClick={openSettings}
            >
              <IconSettings size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className="shell-navbar">
        <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb="sm">
          Menu
        </Text>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              leftSection={<Icon size={20} stroke={1.5} />}
              label={item.label}
              active={activeNav === item.id}
              variant="light"
              color="violet"
              mb={4}
              onClick={() => handleNavClick(item.id)}
            />
          );
        })}
      </AppShell.Navbar>

      <Modal
        opened={statsModalOpened}
        onClose={handleStatsModalClose}
        title={
          <Text fw={800} size="lg" tt="uppercase">
            Estadisticas rapidas
          </Text>
        }
        centered
        size="lg"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        classNames={{
          content: 'stats-modal-content',
          header: 'stats-modal-header',
          body: 'stats-modal-body',
        }}
      >
        <QuickStatsBody />
      </Modal>

      <Modal
        opened={todayModalOpened}
        onClose={handleTodayModalClose}
        title={
          <Text fw={800} size="lg" tt="uppercase">
            Emociones de hoy
          </Text>
        }
        centered
        size="lg"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        classNames={{
          content: 'stats-modal-content',
          header: 'stats-modal-header',
          body: 'stats-modal-body',
        }}
      >
        <EmotionsTodayBody />
      </Modal>

      <Modal
        opened={historyModalOpened}
        onClose={handleHistoryModalClose}
        title={
          <Text fw={800} size="lg" tt="uppercase">
            Historial reciente
          </Text>
        }
        centered
        size="xl"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        classNames={{
          content: 'stats-modal-content',
          header: 'stats-modal-header',
          body: 'stats-modal-body',
        }}
      >
        <RecentHistoryBody />
      </Modal>

      <Modal
        opened={settingsModalOpened}
        onClose={closeSettingsModal}
        title={
          <Text fw={800} size="lg" tt="uppercase">
            Configuracion
          </Text>
        }
        centered
        size="md"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        classNames={{
          content: 'stats-modal-content',
          header: 'stats-modal-header',
          body: 'stats-modal-body',
        }}
      >
        <SettingsAboutBody />
      </Modal>

      <Modal
        opened={profileModalOpened}
        onClose={handleProfileModalClose}
        title={
          <Text fw={800} size="lg" tt="uppercase">
            Perfil
          </Text>
        }
        centered
        size="md"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        classNames={{
          content: 'stats-modal-content',
          header: 'stats-modal-header',
          body: 'stats-modal-body',
        }}
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
      </Modal>

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

              <Text size="xs" fw={800} tt="uppercase">
                Informacion
              </Text>
              <Group mt="md" justify="space-between">
                <Text size="sm">Edad aproximada</Text>
                <Text fw={700}>24 anos</Text>
              </Group>
              <Group mt="xs" justify="space-between">
                <Text size="sm">Genero</Text>
                <Text fw={700}>Masculino</Text>
              </Group>
            </GlassCard>

            <GlassCard>
              <Text size="xs" fw={800} tt="uppercase">
                Detalles actuales
              </Text>
              <Stack mt="lg" gap="lg">
                <div>
                  <Group justify="space-between">
                    <Text size="sm">Confianza</Text>
                    <Text size="sm">92%</Text>
                  </Group>
                  <Progress value={92} color="violet" mt={8} />
                </div>
                <Group justify="space-between">
                  <Text size="sm">Edad</Text>
                  <Text size="sm">24 anos</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Genero</Text>
                  <Text size="sm">Masculino</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Puntos faciales</Text>
                  <Switch defaultChecked color="green" />
                </Group>
              </Stack>
            </GlassCard>
          </aside>

          <section className="center-stage">
            <div className="camera-panel">
              <video ref={videoRef} className="camera-video" autoPlay muted playsInline />
              {status !== 'ready' && (
                <div className="camera-placeholder">
                  <div className="face-frame" />
                  <Text fw={800} size="xl">
                    Vista previa IA
                  </Text>
                  <Text c="dimmed" maw={420} ta="center">
                    Activa la camara para conectar la deteccion facial. La demo mantiene el
                    dashboard funcionando con datos de ejemplo.
                  </Text>
                  <Button mt="md" onClick={startCamera}>
                    Activar camara
                  </Button>
                </div>
              )}
              <div className="scan-corners" />
              <Text className="camera-motivation" ta="right" fw={600}>
                Tu sonrisa puede cambiar tu dia.
              </Text>
            </div>
          </section>

          <aside className="right-column">
            <GlassCard>
              <Text size="xs" fw={800} tt="uppercase">
                Resumen
              </Text>
              <Stack mt="md" gap="sm">
                <SummaryRow label="Detecciones hoy" value="48" />
                <SummaryRow label="Emocion dominante" value="Feliz" />
                <SummaryRow label="Promedio confianza" value="87%" />
                <SummaryRow label="Racha positiva" value="5 dias" />
                <SummaryRow label="Ultima deteccion" value="10:45 AM" />
              </Stack>
            </GlassCard>

            <GlassCard className="actions-card">
              <Text size="xs" fw={800} tt="uppercase">
                Acciones rapidas
              </Text>
              <Action label="Pausar deteccion" icon={<IconPlayerPause size={18} />} />
              <Action label="Modo privado" icon={<IconShieldCheck size={18} />} />
            </GlassCard>
          </aside>
        </section>
      </AppShell.Main>

      <AppShell.Footer className="shell-footer">
        <div className="shell-footer-credits">
          <Text className="shell-footer-line" c="dimmed" ta="left" component="p" m={0}>
            Proyecto de grado desarrollado para Domenica Miranda.
          </Text>
          <Text
            className="shell-footer-line shell-footer-line--quote"
            c="dimmed"
            ta="left"
            component="p"
            m={0}
            lh={1.45}
            style={{ fontStyle: 'italic' }}
          >
            &ldquo;Diseño de un sistema de reconocimiento de gestos faciales y su relación con la
            innovación en la interacción de videojuegos interactivos.&rdquo;
          </Text>
          <Text className="shell-footer-line" c="dimmed" ta="left" component="p" m={0}>
            &copy; 2026 Todos los derechos reservados - Powered by{' '}
            <Anchor
              className="shell-footer-link"
              href="https://acertijo.dev"
              target="_blank"
              rel="noreferrer"
              c="violet.3"
              fw={600}
              underline="hover"
            >
              Acertijo.dev
            </Anchor>
          </Text>
        </div>
      </AppShell.Footer>
    </AppShell>
  );
}

function ProfileEditor({ initialName, initialAvatarId, onSave }) {
  const [name, setName] = useState(initialName);
  const [avatarId, setAvatarId] = useState(initialAvatarId);

  return (
    <Stack gap="lg">
      <TextInput
        label="Nombre de usuario"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        placeholder="Tu nombre"
      />

      <div>
        <Text size="sm" fw={700} mb="xs">
          Elegir avatar
        </Text>
        <Text size="xs" c="dimmed" mb="sm">
          Opciones de estilo para hombre y mujer.
        </Text>
        <SimpleGrid cols={{ base: 3, sm: 3 }} spacing="sm">
          {PROFILE_AVATARS.map((opt) => {
            const AIcon = opt.Icon;
            const selected = avatarId === opt.id;
            return (
              <UnstyledButton
                key={opt.id}
                type="button"
                onClick={() => setAvatarId(opt.id)}
                style={{
                  borderRadius: 12,
                  padding: 8,
                  border: selected
                    ? '2px solid var(--mantine-color-violet-4)'
                    : '2px solid rgba(148, 163, 184, 0.25)',
                  background: selected ? 'rgba(139, 92, 246, 0.14)' : 'rgba(15, 23, 42, 0.35)',
                }}
              >
                <Stack gap={6} align="center">
                  <Avatar size={52} radius="lg" variant="gradient" gradient={opt.gradient}>
                    <AIcon size={26} stroke={1.5} />
                  </Avatar>
                  <Text size="xs" c="dimmed" ta="center" lh={1.25}>
                    {opt.label}
                  </Text>
                </Stack>
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      </div>

      <Stack gap="sm">
        <Button variant="light" color="red" leftSection={<IconTrash size={18} />} type="button">
          Eliminar historial
        </Button>
        <Button variant="light" color="red" leftSection={<IconTrash size={18} />} type="button">
          Eliminar mis datos
        </Button>
        <Button variant="light" color="violet" leftSection={<IconDownload size={18} />} type="button">
          Exportar datos
        </Button>
      </Stack>

      <Button fullWidth type="button" onClick={() => onSave({ name, avatarId })}>
        Guardar
      </Button>
    </Stack>
  );
}

function SettingsAboutBody() {
  const [apiUrl, setApiUrl] = useState(API_URL);
  const [recognitionTime, setRecognitionTime] = useState(DEFAULT_RECOGNITION_TIME);
  const [allowAnimations, setAllowAnimations] = useState(true);
  const [allowAudio, setAllowAudio] = useState(true);

  return (
    <Stack gap="lg">
      <TextInput
        label="URL de la API"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.currentTarget.value)}
        styles={{ input: { wordBreak: 'break-all' } }}
      />
      <TextInput
        label="Tiempo de reconocimiento"
        value={recognitionTime}
        onChange={(e) => setRecognitionTime(e.currentTarget.value)}
      />
      <Checkbox
        label="Permite animaciones"
        checked={allowAnimations}
        onChange={(e) => setAllowAnimations(e.currentTarget.checked)}
      />
      <Checkbox
        label="Permite audio"
        checked={allowAudio}
        onChange={(e) => setAllowAudio(e.currentTarget.checked)}
      />
      <div>
        <Text size="xs" fw={800} tt="uppercase" c="dimmed">
          Descripcion
        </Text>
        <Text size="sm" mt={8} lh={1.65}>
          {APP_DESCRIPTION}
        </Text>
      </div>
      <div>
        <Text size="xs" fw={800} tt="uppercase" c="dimmed">
          Version
        </Text>
        <Text size="sm" mt={8} ff="monospace" fw={600}>
          {APP_VERSION}
        </Text>
      </div>
    </Stack>
  );
}

function RecentHistoryBody() {
  return (
    <div className="history-list history-list--modal">
      {recentHistory.map((item) => (
        <div key={`${item.time}-${item.label}`} className="history-item">
          <span style={{ color: item.color }}>{item.emoji}</span>
          <Text size="xs">{item.time}</Text>
          <Text size="xs">{item.label}</Text>
        </div>
      ))}
    </div>
  );
}

function EmotionsTodayBody() {
  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Badge variant="light">Hoy</Badge>
      </Group>
      <div className="trend trend--modal">
        {emotionTrend.map((point) => (
          <span
            key={point.time}
            className="trend-point"
            style={{ height: `${point.value}%` }}
            title={`${point.time}: ${point.value}%`}
          />
        ))}
      </div>
    </Stack>
  );
}

function QuickStatsBody() {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="lg">
      <RingProgress
        size={140}
        thickness={18}
        sections={emotions.map((emotion) => ({
          value: emotion.confidence,
          color: emotion.color,
        }))}
      />
      <Stack gap={8} style={{ flex: 1 }} miw={0}>
        {emotions.slice(0, 7).map((emotion) => (
          <Group key={emotion.key} gap="xs" justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <span className="dot" style={{ background: emotion.color }} />
              <Text size="sm">{emotion.label}</Text>
            </Group>
            <Text size="sm" fw={700}>
              {emotion.confidence}%
            </Text>
          </Group>
        ))}
      </Stack>
    </Group>
  );
}

function SummaryRow({ label, value }) {
  return (
    <Group justify="space-between">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={800}>
        {value}
      </Text>
    </Group>
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

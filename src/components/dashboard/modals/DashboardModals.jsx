import { EmotionsTodayBody } from "./EmotionsTodayBody.jsx";
import { ProfileEditor } from "./ProfileEditor.jsx";
import { QuickStatsBody } from "./QuickStatsBody.jsx";
import { RecentHistoryBody } from "./RecentHistoryBody.jsx";
import { SettingsAboutBody } from "./SettingsAboutBody.jsx";
import { AppModal } from "../../layout/AppModal.jsx";

export function DashboardModals({
  statsModalOpened,
  onStatsModalClose,
  todayModalOpened,
  onTodayModalClose,
  historyModalOpened,
  onHistoryModalClose,
  settingsModalOpened,
  onSettingsModalClose,
  profileModalOpened,
  onProfileModalClose,
  profileEditorKey,
  userDisplayName,
  userAvatarId,
  onProfileSave,
}) {
  return (
    <>
      <AppModal
        opened={statsModalOpened}
        onClose={onStatsModalClose}
        title="Datos Históricos"
        size="lg"
      >
        <QuickStatsBody />
      </AppModal>

      <AppModal
        opened={todayModalOpened}
        onClose={onTodayModalClose}
        title="Emociones de hoy"
        size="lg"
      >
        <EmotionsTodayBody />
      </AppModal>

      <AppModal
        opened={historyModalOpened}
        onClose={onHistoryModalClose}
        title="Historial reciente"
        size="xl"
      >
        <RecentHistoryBody />
      </AppModal>

      <AppModal
        opened={settingsModalOpened}
        onClose={onSettingsModalClose}
        title="Configuracion"
        size="md"
      >
        <SettingsAboutBody onClose={onSettingsModalClose} />
      </AppModal>

      <AppModal
        opened={profileModalOpened}
        onClose={onProfileModalClose}
        title="Perfil"
        size="md"
      >
        <ProfileEditor
          key={profileEditorKey}
          initialName={userDisplayName}
          initialAvatarId={userAvatarId}
          onSave={onProfileSave}
        />
      </AppModal>
    </>
  );
}

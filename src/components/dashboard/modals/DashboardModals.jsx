import { EmotionsTodayBody } from "./EmotionsTodayBody.jsx";
import { FunMomentsBody } from "./FunMomentsBody.jsx";
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
  funMomentsModalOpened,
  onFunMomentsModalClose,
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
        <QuickStatsBody active={statsModalOpened} />
      </AppModal>

      <AppModal
        opened={historyModalOpened}
        onClose={onHistoryModalClose}
        title="Historial reciente"
        size="xl"
      >
        <RecentHistoryBody active={historyModalOpened} />
      </AppModal>

      <AppModal
        opened={todayModalOpened}
        onClose={onTodayModalClose}
        title="Emociones de hoy"
        size="lg"
      >
        <EmotionsTodayBody active={todayModalOpened} />
      </AppModal>

      <AppModal
        opened={funMomentsModalOpened}
        onClose={onFunMomentsModalClose}
        title="Momentos divertidos"
        size="lg"
        classNames={{
          content: "stats-modal-content fun-moments-modal-content",
          body: "stats-modal-body fun-moments-modal-shell",
        }}
      >
        <FunMomentsBody active={funMomentsModalOpened} />
      </AppModal>

      <AppModal
        opened={settingsModalOpened}
        onClose={onSettingsModalClose}
        title="Configuracion"
        size="lg"
      >
        {settingsModalOpened ? (
          <SettingsAboutBody
            key="settings-form"
            onClose={onSettingsModalClose}
          />
        ) : null}
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

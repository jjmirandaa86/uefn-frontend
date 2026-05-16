import { ActionIcon, Burger, Group } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { AppHour } from "./AppHour.jsx";
import { AppTitle } from "./AppTitle.jsx";
import { AppUser } from "./AppUser.jsx";

export function DashboardHeaderBar({
  mobileOpened,
  onToggleMobile,
  desktopNavbarExpanded,
  onToggleDesktopNavbar,
  time,
  date,
  avatarImageSrc,
  userDisplayName,
  onOpenSettings,
  appTitle = "MoodVision AI",
}) {
  return (
    <Group h="100%" px="sm" justify="space-between" wrap="nowrap" gap="xs">
      <Group gap={6} wrap="nowrap">
        <Burger
          opened={mobileOpened}
          onClick={onToggleMobile}
          hiddenFrom="sm"
          size="sm"
        />
        <Burger
          opened={desktopNavbarExpanded}
          onClick={onToggleDesktopNavbar}
          visibleFrom="sm"
          size="sm"
        />
        <AppTitle title={appTitle} />
      </Group>

      <AppHour time={time} date={date} />

      <Group gap={6} wrap="nowrap" align="center">
        <AppUser
          avatarImageSrc={avatarImageSrc}
          userDisplayName={userDisplayName}
        />
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          aria-label="Configuracion"
          onClick={onOpenSettings}
        >
          <IconSettings size={18} />
        </ActionIcon>
      </Group>
    </Group>
  );
}

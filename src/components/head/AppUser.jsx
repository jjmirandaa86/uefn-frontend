import { Avatar, Group, Stack, Text } from "@mantine/core";

export function AppUser({ avatarImageSrc, userDisplayName }) {
  return (
    <Group
      gap={6}
      wrap="nowrap"
      align="center"
      className="header-recognition"
    >
      <Avatar
        className="header-recognition-avatar"
        size={32}
        radius="lg"
        src={avatarImageSrc}
        alt=""
        aria-hidden
      />
      <Stack gap={1} justify="center" miw={0}>
        <Text
          className="header-recognition__label"
          c="dimmed"
          lh={1.1}
          component="span"
        >
          Reconocido como:
        </Text>
        <Text
          className="header-recognition__name"
          fw={800}
          c="green.4"
          lh={1.1}
          component="span"
        >
          {userDisplayName}
        </Text>
      </Stack>
    </Group>
  );
}

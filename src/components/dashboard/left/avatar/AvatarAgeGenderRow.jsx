import { Avatar, Group, Stack, Text } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

export function AvatarAgeGenderRow({
  age = "24 años",
  gender = "Masculino",
  gradient = { from: "violet", to: "cyan", deg: 125 },
  icon: IconComponent = IconUser,
}) {
  return (
    <Group gap="md" wrap="nowrap" align="flex-start">
      <Avatar
        size={56}
        radius="lg"
        variant="gradient"
        gradient={gradient}
        aria-hidden
        style={{ flexShrink: 0 }}
      >
        <IconComponent size={26} stroke={1.5} />
      </Avatar>
      <Stack gap={6} justify="center" miw={0} style={{ flex: 1 }}>
        <Text fw={800} size="lg" lh={1.25}>
          {age}
        </Text>
        <Text size="sm" c="dimmed" lh={1.25}>
          {gender}
        </Text>
      </Stack>
    </Group>
  );
}

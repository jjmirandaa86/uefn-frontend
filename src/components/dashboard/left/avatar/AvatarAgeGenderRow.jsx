import { Avatar, Group, Stack, Text } from "@mantine/core";
import { IconMan, IconUser, IconWoman } from "@tabler/icons-react";

const ICON = { size: 28, stroke: 1.5 };

/** Fila edad/género: icono Tabler (hombre / mujer / neutro), sin imágenes. */
export function AvatarAgeGenderRow({
  age = "—",
  gender = "Sin detección",
  symbol = "neutral",
  gradient = { from: "violet", to: "cyan", deg: 125 },
}) {
  const Glyph =
    symbol === "male" ? IconMan : symbol === "female" ? IconWoman : IconUser;

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
        <Glyph {...ICON} />
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

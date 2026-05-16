import {
  Avatar,
  Group,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";

export function AvatarGenderScrollRow({ title, items, avatarId, setAvatarId }) {
  return (
    <div>
      <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb={6}>
        {title}
      </Text>
      <ScrollArea
        type="scroll"
        scrollbars="x"
        offsetScrollbars="x"
        w="100%"
        styles={{
          viewport: { paddingBottom: 6 },
          scrollbar: { zIndex: 1 },
        }}
      >
        <Group gap="sm" wrap="nowrap" pb={4} pr={4}>
          {items.map((opt) => {
            const selected = avatarId === opt.id;
            return (
              <UnstyledButton
                key={opt.id}
                type="button"
                onClick={() => setAvatarId(opt.id)}
                title={opt.label}
                style={{
                  borderRadius: 12,
                  padding: 8,
                  flexShrink: 0,
                  border: selected
                    ? "2px solid var(--mantine-color-violet-4)"
                    : "2px solid rgba(148, 163, 184, 0.25)",
                  background: selected
                    ? "rgba(139, 92, 246, 0.14)"
                    : "rgba(15, 23, 42, 0.35)",
                }}
              >
                <Stack gap={6} align="center">
                  <Avatar
                    size={70}
                    radius="lg"
                    src={opt.imageSrc}
                    alt={opt.label}
                    styles={{
                      image: { objectFit: "cover" },
                    }}
                  />
                </Stack>
              </UnstyledButton>
            );
          })}
        </Group>
      </ScrollArea>
    </div>
  );
}

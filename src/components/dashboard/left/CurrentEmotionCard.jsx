import { Stack, Text } from "@mantine/core";

export function CurrentEmotionCard({ emotion, detectedDuration = "00:00:15" }) {
  return (
    <Stack
      gap="lg"
      w="100%"
      maw="100%"
      miw={0}
      className="current-emotion-card"
    >
      <Text size="xs" fw={800} tt="uppercase">
        Emocion actual
      </Text>

      <Stack align="center" gap="sm" w="100%" maw="100%" miw={0}>
        <div className="emotion-orb" style={{ fontSize: "120px" }}>
          {emotion.emoji}
        </div>
        <Text
          className="current-emotion-card__label"
          c="green.4"
          fw={800}
          ta="center"
          lh={1.1}
          style={{ wordBreak: "break-word" }}
        >
          {emotion.label}
        </Text>
      </Stack>

      <Stack gap={4} w="100%" mt="auto">
        <Text size="xs" c="dimmed">
          Tiempo detectado
        </Text>
        <Text fw={700}>{detectedDuration}</Text>
      </Stack>
    </Stack>
  );
}

import { Stack, Text } from "@mantine/core";

function emotionOrbStyle(color) {
  return {
    background: `radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.38) 0%, ${color} 48%, ${color} 68%, rgba(15, 23, 42, 0.35) 100%)`,
    boxShadow: `0 0 28px color-mix(in srgb, ${color} 55%, transparent), 0 0 52px color-mix(in srgb, ${color} 28%, transparent)`,
  };
}

export function CurrentEmotionCard({ emotion, detectedDuration = "00:00:00" }) {
  return (
    <Stack
      gap="lg"
      w="100%"
      maw="100%"
      miw={0}
      className="current-emotion-card"
    >
      <Text size="xs" fw={800} tt="uppercase" c="gray.0">
        Emoción actual
      </Text>

      <Stack align="center" gap="sm" w="100%" maw="100%" miw={0}>
        <div
          className="emotion-orb emotion-orb--live"
          style={emotionOrbStyle(emotion.color)}
          aria-hidden
        >
          <span className="emotion-orb__emoji" style={{ fontSize: "120px" }}>
            {emotion.emoji}
          </span>
        </div>
        <Text
          className="current-emotion-card__label"
          fw={800}
          ta="center"
          lh={1.1}
          style={{ wordBreak: "break-word", color: emotion.color }}
        >
          {emotion.label}
        </Text>
      </Stack>

      <Stack gap={4} w="100%" mt="auto">
        <Text size="xs" c="dimmed">
          Tiempo detectado
        </Text>
        <Text fw={800} fz="1.75rem" c="gray.0" lh={1.1} ff="monospace">
          {detectedDuration}
        </Text>
      </Stack>
    </Stack>
  );
}

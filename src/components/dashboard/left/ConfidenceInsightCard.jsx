import { Center, RingProgress, Stack, Text } from "@mantine/core";

function qualityCopy(value) {
  if (value >= 75) {
    return {
      label: "Alta",
      description:
        "La emoción detectada tiene un alto nivel de confianza según el análisis del modelo.",
    };
  }
  if (value >= 40) {
    return {
      label: "Media",
      description:
        "La emoción detectada tiene un nivel de confianza moderado según el análisis del modelo.",
    };
  }
  return {
    label: "Baja",
    description:
      "La emoción detectada tiene un nivel de confianza bajo según el análisis del modelo.",
  };
}

export function ConfidenceInsightCard({ value = 87, ringColor = "#8b5cf6" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const { label, description } = qualityCopy(pct);

  return (
    <Stack
      gap="md"
      className="confidence-insight-card"
      w="100%"
      maw="100%"
      miw={0}
      align="stretch"
    >
      <Center w="100%" maw="100%" px={4}>
        <RingProgress
          size={128}
          thickness={14}
          roundCaps
          sections={[{ value: pct, color: ringColor }]}
          styles={{
            root: { flexShrink: 0, maxWidth: "100%" },
          }}
          label={
            <Center>
              <Stack gap={2} align="center" justify="center">
                <Text fz="xl" fw={800} c="gray.0" lh={1.1}>
                  {pct}%
                </Text>
                <Text size="sm" c="dimmed" fw={500}>
                  {label}
                </Text>
              </Stack>
            </Center>
          }
        />
      </Center>

      <Stack gap="xs" w="100%" maw="100%" miw={0}>
        <Text size="sm" fw={700} c="gray.0">
          Nivel de confianza
        </Text>
        <Text
          size="xs"
          c="dimmed"
          lh={1.55}
          className="confidence-insight-card__description"
        >
          {description}
        </Text>
      </Stack>
    </Stack>
  );
}

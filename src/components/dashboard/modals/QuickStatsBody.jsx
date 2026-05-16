import { Group, RingProgress, Stack, Text } from "@mantine/core";
import { emotions } from "../../../data/emotions";

export function QuickStatsBody() {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="lg">
      <RingProgress
        size={140}
        thickness={18}
        sections={emotions.map((emotion) => ({
          value: emotion.confidence,
          color: emotion.color,
        }))}
      />
      <Stack gap={8} style={{ flex: 1 }} miw={0}>
        {emotions.slice(0, 7).map((emotion) => (
          <Group
            key={emotion.key}
            gap="xs"
            justify="space-between"
            wrap="nowrap"
          >
            <Group gap="xs" wrap="nowrap">
              <span className="dot" style={{ background: emotion.color }} />
              <Text size="sm">{emotion.label}</Text>
            </Group>
            <Text size="sm" fw={700}>
              {emotion.confidence}%
            </Text>
          </Group>
        ))}
      </Stack>
    </Group>
  );
}

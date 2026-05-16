import { Badge, Group, Stack, Text } from "@mantine/core";
import { emotionTrend } from "../../../data/emotions.js";

export function EmotionsTodayBody() {
  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Badge variant="light">Hoy</Badge>
      </Group>
      <div className="trend trend--modal">
        {emotionTrend.map((point) => (
          <div key={point.time} className="trend-slot">
            <div className="trend-bar-cell">
              <span
                className="trend-point"
                style={{ height: `${point.value}%` }}
                title={`${point.time}: ${point.value}% — emoción referencial ${point.emoji}`}
              />
            </div>
            <Text
              className="trend-value-label"
              size="xs"
              fw={700}
              c="gray.0"
              ta="center"
              lh={1.1}
            >
              {point.value}
            </Text>
            <span className="trend-emoji" aria-hidden>
              {point.emoji}
            </span>
          </div>
        ))}
      </div>
    </Stack>
  );
}

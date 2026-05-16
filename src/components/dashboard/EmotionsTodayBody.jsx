import { Badge, Group, Stack } from "@mantine/core";
import { emotionTrend } from "../../data/emotions";

export function EmotionsTodayBody() {
  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Badge variant="light">Hoy</Badge>
      </Group>
      <div className="trend trend--modal">
        {emotionTrend.map((point) => (
          <span
            key={point.time}
            className="trend-point"
            style={{ height: `${point.value}%` }}
            title={`${point.time}: ${point.value}%`}
          />
        ))}
      </div>
    </Stack>
  );
}

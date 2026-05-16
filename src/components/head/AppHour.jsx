import { Divider, Stack, Text } from "@mantine/core";

export function AppHour({ time, date }) {
  return (
    <Stack gap={0} align="center" visibleFrom="sm" style={{ flex: 1 }} miw={0}>
      <Text size="xxl" fw={800} lh={1.2}>
        {time}
      </Text>
      <Divider size="xs" />
      <Text size="xs" c="dimmed" tt="capitalize" lh={1.2} lineClamp={1}>
        {date}
      </Text>
    </Stack>
  );
}

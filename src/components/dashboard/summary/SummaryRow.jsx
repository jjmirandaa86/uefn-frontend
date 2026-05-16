import { Group, Text } from "@mantine/core";

export function SummaryRow({ label, value }) {
  return (
    <Group justify="space-between">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={800}>
        {value}
      </Text>
    </Group>
  );
}

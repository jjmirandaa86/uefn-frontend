import { useMemo, useState } from "react";
import { Checkbox, Group, RingProgress, Stack, Text } from "@mantine/core";
import { emotions } from "../../../data/emotions.js";
import { useEmotionHistoryStats } from "../../../hooks/useEmotionHistoryStats.js";

function defaultCheckedKeys() {
  return new Set(emotions.map((e) => e.key));
}

export function QuickStatsBody({ active = true }) {
  const { total, rows, loading, error } = useEmotionHistoryStats({
    enabled: active,
  });
  const [checkedKeys, setCheckedKeys] = useState(defaultCheckedKeys);

  const selectedRows = useMemo(
    () => rows.filter((row) => checkedKeys.has(row.key)),
    [rows, checkedKeys],
  );

  const selectedTotal = useMemo(
    () => selectedRows.reduce((sum, row) => sum + row.count, 0),
    [selectedRows],
  );

  const ringSections = useMemo(() => {
    if (selectedTotal <= 0) return [];

    return selectedRows
      .filter((row) => row.count > 0)
      .map((row) => {
        const sharePercent = (row.count / selectedTotal) * 100;
        return {
          value: sharePercent,
          color: row.color,
          tooltip: `${row.label}: ${row.count} (${Math.round(sharePercent)}%)`,
        };
      });
  }, [selectedRows, selectedTotal]);

  const toggleEmotion = (key, checked) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  if (loading && total === 0) {
    return (
      <Text size="sm" c="dimmed">
        Cargando estadísticas…
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="sm" c="red.4">
        {error}
      </Text>
    );
  }

  if (total === 0) {
    return (
      <Text size="sm" c="dimmed">
        Aún no hay registros en el historial. Activa la cámara para empezar a
        acumular datos.
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        Total registros: {total}
        {selectedTotal !== total
          ? ` · Mostrando: ${selectedTotal}`
          : ""}
      </Text>
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="lg">
        <RingProgress
          size={140}
          thickness={18}
          sections={ringSections}
          label={
            <Text ta="center" size="xs" fw={700}>
              {selectedTotal}
            </Text>
          }
        />
        <Stack gap={8} style={{ flex: 1 }} miw={0}>
          {rows.map((emotion) => (
            <Group
              key={emotion.key}
              gap="xs"
              justify="space-between"
              wrap="nowrap"
            >
              <Checkbox
                color="violet"
                size="xs"
                checked={checkedKeys.has(emotion.key)}
                onChange={(e) =>
                  toggleEmotion(emotion.key, e.currentTarget.checked)
                }
                label={
                  <Group gap="xs" wrap="nowrap" miw={0}>
                    <span
                      className="dot"
                      style={{ background: emotion.color }}
                    />
                    <Text size="sm" truncate>
                      {emotion.label}
                    </Text>
                  </Group>
                }
                styles={{
                  root: { alignItems: "center", flex: 1, minWidth: 0 },
                  label: { paddingLeft: 6 },
                  body: { minWidth: 0 },
                }}
              />
              <Text size="sm" fw={700} style={{ flexShrink: 0 }}>
                {emotion.count}
              </Text>
            </Group>
          ))}
        </Stack>
      </Group>
      {checkedKeys.size === 0 ? (
        <Text size="xs" c="dimmed">
          Marca al menos una emoción para ver el gráfico.
        </Text>
      ) : null}
    </Stack>
  );
}

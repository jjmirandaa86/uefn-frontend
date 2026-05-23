import { Badge, Group, Stack, Text } from "@mantine/core";
import { useTodayEmotionBars } from "../../../hooks/useTodayEmotionBars.js";

export function EmotionsTodayBody({ active = true }) {
  const { bars, total, loading, error } = useTodayEmotionBars({
    enabled: active,
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
          {total > 0 ? `Total hoy: ${total}` : "Sin registros hoy"}
        </Text>
        <Badge variant="light">Hoy</Badge>
      </Group>

      {loading && bars.length === 0 ? (
        <Text size="sm" c="dimmed">
          Cargando emociones de hoy…
        </Text>
      ) : null}

      {error ? (
        <Text size="sm" c="red.4">
          {error}
        </Text>
      ) : null}

      {!loading && !error && bars.length === 0 ? (
        <Text size="sm" c="dimmed">
          Aún no hay detecciones hoy. Activa la cámara para empezar a registrar
          emociones.
        </Text>
      ) : null}

      {bars.length > 0 ? (
        <div
          className="trend trend--modal"
          role="img"
          aria-label="Emociones de hoy"
        >
          {bars.map((point) => (
            <div key={point.key} className="trend-slot">
              <div className="trend-bar-cell">
                <span
                  className="trend-point trend-point--emotion"
                  style={{
                    height: `${point.barPercent}%`,
                    background: point.color,
                    boxShadow: `0 0 16px ${point.color}99`,
                  }}
                  title={`${point.label}: ${point.count} (${point.share}%)`}
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
                {point.count}
              </Text>
              <span className="trend-emoji" aria-hidden>
                {point.emoji}
              </span>
              <Text
                className="trend-time-label"
                size="xs"
                c="dimmed"
                ta="center"
                truncate
                maw="100%"
              >
                {point.label}
              </Text>
            </div>
          ))}
        </div>
      ) : null}
    </Stack>
  );
}

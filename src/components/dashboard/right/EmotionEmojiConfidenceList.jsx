import {
  Box,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { IconChevronRight, IconLayoutList } from "@tabler/icons-react";
import { emotions as defaultEmotions } from "../../../data/emotions.js";

const CONFIDENCE_BY_EMOTION_TOOLTIP = [
  'La "Confianza por emoción" es el porcentaje de probabilidad con el que la IA estima cada emoción a partir del rostro (expresión, ojos, boca, cejas, landmarks y patrones aprendidos por el modelo).',
  "",
  "Ejemplo: Feliz 92 %, Neutral 5 %, Triste 2 %, Enojado 1 %: la emoción dominante es Feliz con alta seguridad; no es certeza al 100 %, sino una estimación.",
  "",
  "Sirve para ver cuánto confía el modelo, comparar emociones, mostrar gráficos más claros y reducir detecciones falsas.",
].join("\n");

function barColor(row) {
  return row.color ?? "#94a3b8";
}

function rowLabel(row) {
  return row.label;
}

function ConfidenceBar({ value, fillColor }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <Box
      className="ecb-bar-track"
      style={{ flex: 1, minWidth: 0, maxWidth: "100%" }}
    >
      <Box
        className="ecb-bar-fill"
        style={{
          width: `${pct}%`,
          background: fillColor,
          opacity: pct > 0 ? 1 : 0,
        }}
      />
    </Box>
  );
}

export function EmotionEmojiConfidenceList({
  items = defaultEmotions,
  title = "Confianza por emocion",
  showCta = true,
  maxRows,
  onViewFullAnalysis,
}) {
  const sorted = [...items].sort((a, b) => b.confidence - a.confidence);
  const rows =
    typeof maxRows === "number" && maxRows >= 0
      ? sorted.slice(0, maxRows)
      : sorted;

  return (
    <Stack gap={0} className="emotion-confidence-list">
      <Tooltip
        label={CONFIDENCE_BY_EMOTION_TOOLTIP}
        multiline
        maw={360}
        position="bottom"
        withArrow
        openDelay={200}
        events={{ hover: true, focus: true, touch: true }}
      >
        <Group
          gap="sm"
          wrap="nowrap"
          align="center"
          mb="lg"
          miw={0}
          style={{ cursor: "help", width: "fit-content", maxWidth: "100%" }}
          tabIndex={0}
        >
          <ThemeIcon
            size={40}
            radius="md"
            variant="gradient"
            gradient={{ from: "violet.6", to: "grape.8" }}
            aria-hidden
          >
            <IconLayoutList size={22} stroke={1.5} color="white" />
          </ThemeIcon>
          <Text size="sm" fw={800} c="gray.0" tt="uppercase" lh={1.2}>
            {title}
          </Text>
        </Group>
      </Tooltip>

      <Stack gap="lg">
        {rows.map((row) => (
          <Group
            key={row.key}
            gap="md"
            wrap="nowrap"
            align="center"
            justify="flex-start"
          >
            <Text
              component="span"
              lh={1}
              style={{
                fontSize: "1.5rem",
                lineHeight: 1,
                width: "2.25rem",
                textAlign: "center",
                flexShrink: 0,
              }}
              aria-hidden
            >
              {row.emoji}
            </Text>
            <Text
              size="sm"
              fw={600}
              c="gray.0"
              style={{ minWidth: "6.5rem", flexShrink: 0 }}
            >
              {rowLabel(row)}
            </Text>
            <ConfidenceBar value={row.confidence} fillColor={barColor(row)} />
            <Text
              size="sm"
              fw={600}
              c="gray.0"
              style={{ width: "2.75rem", textAlign: "right", flexShrink: 0 }}
            >
              {row.confidence}%
            </Text>
          </Group>
        ))}
      </Stack>

      {showCta && (
        <UnstyledButton
          type="button"
          className="ecb-cta"
          mt="xl"
          onClick={() => onViewFullAnalysis?.()}
        >
          <Group justify="center" gap={6} wrap="nowrap">
            <Text size="sm" c="violet.3" fw={600}>
              Emociones de hoy
            </Text>
            <IconChevronRight
              size={18}
              stroke={1.75}
              color="var(--mantine-color-violet-3)"
            />
          </Group>
        </UnstyledButton>
      )}
    </Stack>
  );
}

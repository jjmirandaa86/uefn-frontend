import { Group, Stack, Text } from "@mantine/core";
import { emotions as defaultEmotions } from "../data/emotions.js";

const EMOJI_FONT = ["2.75rem", "2rem", "1.35rem", "1.2rem"];
const PCT_SIZE = ["xl", "lg", "md", "sm"];
const PCT_WEIGHT = [800, 700, 700, 600];

function rowSizeIndex(i) {
  return Math.min(i, 3);
}

/**
 * Lista vertical: una carita por linea + porcentaje alineado a la derecha.
 * Lineas 1–3: emoji y texto grande, medio y pequeño; el resto tamano normal.
 */
export function EmotionEmojiConfidenceList({ items = defaultEmotions }) {
  return (
    <Stack gap="md">
      {items.map((row, i) => {
        const si = rowSizeIndex(i);
        return (
          <Group
            key={row.key}
            justify="space-between"
            align="center"
            wrap="nowrap"
            gap="md"
          >
            <Text
              component="span"
              lh={1}
              style={{
                fontSize: EMOJI_FONT[si],
                lineHeight: 1,
              }}
              aria-hidden
            >
              {row.emoji}
            </Text>
            <Text
              size={PCT_SIZE[si]}
              fw={PCT_WEIGHT[si]}
              style={{ color: row.color, flexShrink: 0 }}
            >
              {row.confidence}%
            </Text>
          </Group>
        );
      })}
    </Stack>
  );
}

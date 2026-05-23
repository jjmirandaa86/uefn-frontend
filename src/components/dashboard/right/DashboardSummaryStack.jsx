import { Stack, Text } from "@mantine/core";
import { useTodayEmotionSummary } from "../../../hooks/useTodayEmotionSummary.js";
import { SummaryRow } from "./summary/SummaryRow.jsx";

export function DashboardSummaryStack() {
  const { rows, loading, error } = useTodayEmotionSummary();

  if (error) {
    return (
      <Text size="sm" c="red.4" mt="sm">
        {error}
      </Text>
    );
  }

  return (
    <Stack mt="md" gap="sm">
      <SummaryRow
        label="Detecciones hoy"
        value={loading ? "…" : rows.deteccionesHoy}
      />
      <SummaryRow
        label="Emocion dominante"
        value={loading ? "…" : rows.emocionDominante}
      />
      <SummaryRow
        label="Promedio confianza"
        value={loading ? "…" : rows.promedioConfianza}
      />
      <SummaryRow
        label="Ultima deteccion"
        value={loading ? "…" : rows.ultimaDeteccion}
      />
    </Stack>
  );
}

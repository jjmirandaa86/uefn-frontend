import { Stack } from "@mantine/core";
import { SummaryRow } from "./summary/SummaryRow.jsx";

export function DashboardSummaryStack() {
  return (
    <Stack mt="md" gap="sm">
      <SummaryRow label="Detecciones hoy" value="48" />
      <SummaryRow label="Emocion dominante" value="Feliz" />
      <SummaryRow label="Promedio confianza" value="87%" />
      <SummaryRow label="Racha positiva" value="5 dias" />
      <SummaryRow label="Ultima deteccion" value="10:45 AM" />
    </Stack>
  );
}

import { Text } from "@mantine/core";
import { EmotionEmojiConfidenceList } from "../EmotionEmojiConfidenceList.jsx";
import { DashboardSummaryStack } from "./DashboardSummaryStack.jsx";

function GlassCard({ children, className = "" }) {
  return <section className={`glass-card ${className}`}>{children}</section>;
}

export function DashboardRightColumn() {
  return (
    <aside className="right-column">
      <GlassCard>
        <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb="sm">
          Confianza por emocion
        </Text>
        <EmotionEmojiConfidenceList />
      </GlassCard>
      <GlassCard>
        <Text size="xs" fw={800} tt="uppercase">
          Resumen
        </Text>
        <DashboardSummaryStack />
      </GlassCard>
    </aside>
  );
}

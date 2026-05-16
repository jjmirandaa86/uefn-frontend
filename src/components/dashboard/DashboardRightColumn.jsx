import { Text } from "@mantine/core";
import { EmotionEmojiConfidenceList } from "./right/EmotionEmojiConfidenceList.jsx";
import { DashboardSummaryStack } from "./right/DashboardSummaryStack.jsx";

function GlassCard({ children, className = "" }) {
  return <section className={`glass-card ${className}`}>{children}</section>;
}

export function DashboardRightColumn({ onOpenEmotionsToday }) {
  return (
    <aside className="right-column">
      <GlassCard>
        <EmotionEmojiConfidenceList
          title="Confianza por emocion"
          onViewFullAnalysis={onOpenEmotionsToday}
        />
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
